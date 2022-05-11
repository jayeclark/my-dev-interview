import { useState, useEffect, useContext } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import RecordView from '../components/RecordView'
import { getQuestionIDs, getQuestion } from '../scripts/queries'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const theme = useTheme();
  const API_URL = process.env.API_URL || 'http://localhost:1337'
  const askedArray: Array<number> = []
  const filterArray: Array<string> = []
  const [question, setQuestion] = useState({id: -1, content: '', category: ''});
  const [count, setCount] = useState(0);
  const [asked, setAsked] = useState(askedArray);
  const [filters, setFilters] = useState(filterArray);

  useEffect(() => {
    getQuestionCount().then(async (res) => {
        setCount(res);
        const newQuestion = await getNextQuestion(res);
        setQuestion(newQuestion);
      })
  }, [])

  useEffect(() => {
    if (filters.length > 0 && !filters.includes(question.category.split("_")[0])) {
      getNextQuestion().then((res) => setQuestion(res));
    }
  }, [filters])

  const getQuestionCount = async () => {
    let currentCount = 1000;
    let totalCount = 0;
    while (currentCount == 1000) {
      const response = await fetch(`${API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: getQuestionIDs
        })
      })
      const parsedResponse = await response.json();
      const data = await parsedResponse.data.questions.data;
      totalCount += data.length;
      currentCount = data.length;
    }

    return totalCount;
  }

  const fetchQuestion = async (idToFetch: number) => {
    const response = await fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getQuestion,
        variables: {
          id: idToFetch
        }
      })
    })
    const parsedResponse = await response.json();
    const { data } = await parsedResponse;
    const { question: fetchedQuestion } = await data;
    return fetchedQuestion;
  }

  const getPreviousQuestion = async (idToFetch: number) => {
    const prevQuestion = await fetchQuestion(idToFetch)
    return {
      id: idToFetch,
      content: prevQuestion.data.attributes.question,
      category: prevQuestion.data.attributes.category
      };
  }

  const getRandomQuestion = async (length: number) => {
    let idToFetch = -1;
    while (idToFetch < 0) {
      const randomID = parseInt((Math.random() * (length - 1)).toFixed(0));
      if (asked.includes(randomID + 1) === false || (asked.length >= 30 && asked.slice(asked.length - 15).includes(randomID + 1) === false)) {
        idToFetch = randomID + 1;
      }
    }
    const randomQuestion = await fetchQuestion(idToFetch);
    return randomQuestion;
  }

  const getNextQuestion = async (length = count) => {
    let nextQuestion = await getRandomQuestion(length);
    while (filters.length > 0 && !filters.includes(nextQuestion.data.attributes.category.split("_")[0])) {
      nextQuestion = await getRandomQuestion(length);
    }
    console.log(nextQuestion)

    return {
      id: nextQuestion.data.id,
      content: nextQuestion.data.attributes.question,
      category: nextQuestion.data.attributes.category
      };
  }

  const handleNext = async () => {
    const newAsked = [...asked];
    newAsked.push(question.id);
    setAsked(newAsked);
    getNextQuestion(count).then((res) => {
      setQuestion(res);
    })
  }

  const handleSkip = async () => {
    getNextQuestion(count).then((res) => {
      console.log(res);
      setQuestion(res);
      setTimeout(() => console.log(question), 100);
    })
  }

  const handlePrevious = async () => {
    getPreviousQuestion(asked[asked.length - 1]).then((res) => {
      setQuestion(res);
    })
  }

  const toggleFilter = (filter: string) => {
    console.log("toggled")
    let newFilters;
    if (filters.includes(filter)) {
      newFilters = filters.filter(f => f !== filter);
    } else {
      newFilters = [...filters, filter];
    }
    console.log(newFilters);
    setFilters(newFilters);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>My Dev Interview</title>
        <meta name="description" content="Video interview simulator with some wildcards thrown in." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className="options">
          <span><b>Filter by:</b></span>
          <Chip color={filters.includes("Behavioral") ? "primary" : "default"} onClick={() => toggleFilter("Behavioral")} clickable sx={{ m: 0.5, px: 2 }} label="Behavioral" />
          <Chip color={filters.includes("Communication") ? "primary" : "default"} onClick={() => toggleFilter("Communication")} clickable sx={{ m: 0.5, px: 2 }} className="option-chip" label="Communication" />
          <Chip color={filters.includes("Opinion") ? "primary" : "default"} onClick={() => toggleFilter("Opinion")} clickable sx={{ m: 0.5, px: 2 }} className="option-chip" label="Opinion" />
          <Chip color={filters.includes("Technical") ? "primary" : "default"} onClick={() => toggleFilter("Technical")} clickable sx={{ m: 0.5, px: 2 }} className="option-chip" label="Technical" />
        </section>
        <section className="question">
          <Card variant="outlined" sx={{ mb: theme.spacing(2), p: theme.spacing(3), display: 'flex', width: '100%', height: '10vw', minHeight: '100px', alignItems: 'center', justifyContent: 'center' }}>
            <div><b>{question.content}</b></div>
          </Card>
          <RecordView handleNextQuestion={handleNext} key={question.id} questionId={question.id}/>
          <div className="buttons">
            <div>
            {asked.length > 0 && <Button size="large" variant="text" onClick={handlePrevious}>&lt;&lt;&nbsp;Previous Question</Button>}
            
            </div>
            <div>
            <Button size="large" variant="text" onClick={handleSkip}>Skip Question&nbsp;&gt;&gt;</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; 2022 Jay Clark
        </a>
      </footer>
      <style jsx>{`
        .question {
          width: calc(min(72vh, 72vw));
          height: calc(min(54vh, 54vw) + 182px);
          min-width: calc(min(72vh, 72vw));
          min-height: calc(min(54vh, 54vw) + 182px);
          max-width: 1600px;
          max-height: calc(min(1200px, 100vh - 120));
        }
        .buttons {
          display: flex!important:
          flex-wrap: nowrap;
          width: 100%;
          flex-wrap: nowrap;
          justify-content: space-between;
          justify-items: space-between;
          align-content: center;
          align-items: center;
        }
        .options {
          padding: 0px 0px 16px 0px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: calc(min(72vh, 72vw));
          min-width: calc(min(72vh, 72vw));
          max-width: 1600px;
        }
      `}</style>
    </div>
  )
}

export default Home
