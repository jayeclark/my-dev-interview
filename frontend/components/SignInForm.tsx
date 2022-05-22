import { useState, useContext, useEffect, useMemo, useRef, MutableRefObject } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { useTheme } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Google from "../assets/google.svg"
import Github from "../assets/github.png"
import EyeFill from "../assets/eye-fill.svg"
import EyeFillSlash from "../assets/eye-slash-fill.svg"
import Close from "../assets/x-lg.svg"
import { API_URL } from "../pages/index"
import { authorizationUrl } from "../scripts/config"
import { UserContext } from "../scripts/context"

interface SignInFormProps {
  showSignIn: boolean;
  setShowSignIn: Function;
}

function SignInForm({ showSignIn, setShowSignIn }: SignInFormProps) {
  const { handleSetUser, user } = useContext(UserContext);
  const router = useRouter();
  const theme = useTheme();

  const [ signup, setSignup ] = useState(false);
  const [ showPassword, setShowPassword ] = useState(false);
  const [ showConfirm, setShowConfirm ] = useState(false);
  const [ showGoogle, setShowGoogle ] = useState(false)

  const createUser = async ({ email, password }: { email: string; password: string}) => {
    if (typeof window === "undefined") {
      return;
    }
    const url = `${API_URL}/api/auth/local/register`
    const body = {
      username: email, 
      email: email,
      password: password
    }
    console.log('body')
    console.log(body);
    return new Promise((resolve, reject) => {
      try {
        axios.post(url, body).then(response => {
          console.log(response.data);
          
          handleSetUser({
            email: response.data.user.email,
            jwt: response.data.jwt,
            username: response.data.user.username,
            id: response.data.user.id
          })
          setShowSignIn(false);
          setSignup(false);
          resolve(response);
        })
      } catch (e) {
        console.log(e)
        reject(e);
      }
    })

    }
  
  const authUser = async ({ email, password }: { email: string; password: string}) => {
    if (typeof window === "undefined") {
      return;
    }
    const url = `${API_URL}/api/auth/local`
    const body = {
      identifier: email, 
      password: password
    }
    console.log('body')
    console.log(body);
    return new Promise((resolve, reject) => {
      try {
        axios.post(url, body).then(response => {
          console.log(response.data);
          
          handleSetUser({
            email: response.data.user.email,
            jwt: response.data.jwt,
            username: response.data.user.username,
            id: response.data.user.id
          })
          setShowSignIn(false);
          setSignup(false);
          resolve(response);
        })
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }

  const redirectToGoogle = () => {
    if (window) {
      window.location = `${API_URL}/api/connect/google` as unknown as Location
    }
  }

  const redirectToGitHub = () => {
    if (window) {
      window.location = `${API_URL}/api/connect/github` as unknown as Location
    }
  }

  const retrieveUserData = async () => {
    console.log("called")
    const jwt = localStorage.getItem("mdi-session-access-token")
    if (jwt) {
      console.log("token")
      const decoded = jwtDecode(jwt)
      const response = await axios.get(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${jwt}`}})
      const data = await response.data
      console.log(data)
      handleSetUser({
        email: data.email,
        jwt: jwt,
        username: data.username,
        id: data.id
      })
      console.log(decoded)
      setShowGoogle(false)
      setShowSignIn(false)
    }
  }

  useEffect(() => { if (!user.id) { retrieveUserData() } }, [user])

  return (
    <>
      <Dialog open={showSignIn}>
        <Box sx={{ p: 2 }}>
          <div style={{ paddingBottom: 16, cursor: 'pointer', textAlign: 'right', fontWeight: '600' }} onClick={() => { setShowSignIn(false); }}>
            <Image src={Close} alt="close sign in dialog" />
          </div>
          <Button variant="google" size="large" style={{ marginBottom: 16, width: "100%"}} onClick={(redirectToGoogle)}>
            <Image height="24" width="24" src={Google} alt="Google Logo"/>
            <span style={{ marginLeft: 8 }}>Sign in with Google</span>
          </Button>
          <Button variant="github" size="large" style={{ marginBottom: 16, width: "100%"}} onClick={(redirectToGitHub)}>
            <Image height="24" width="24" src={Github} alt="GitHub Logo" />
            <span style={{ marginLeft: 8 }}>Sign in with GitHub</span>
          </Button>
          <hr />
          <form style={{ marginTop: 24 }} onSubmit={(e) => {
            e.preventDefault();
            if (signup) {
              const form = e.target as HTMLFormElement;
              console.log(form.email.value, form.password.value);
              createUser({ email: form.email.value, password: form.password.value })
            } else {
              const form = e.target as HTMLFormElement;
              authUser({ email: form.email.value, password: form.password.value })
            }

          }}>
            <TextField id="email" type="text" label="Email" name="email" fullWidth sx={{ mb: 2 }} />
            <div style={{ position: 'relative' }}>
              <TextField id="password" type={showPassword ? "text" : "password"} label="Password" name="password"  fullWidth  sx={{ mb: 2 }} />
              <div style={{ position: 'absolute', top: 20, right: 16 }} onClick={() => setShowPassword(!showPassword)}>
                <Image style={{ cursor: 'pointer', color: 'inherit' }} src={showPassword ? EyeFillSlash : EyeFill} alt={showPassword ? "Hide Password" : "Show Password"}/>
              </div>
            </div>
            {signup && (
              <div style={{ position: 'relative' }}>
                <TextField id="password2" type={showConfirm ? "text" : "password"} label="Confirm Password" name="password2"  fullWidth sx={{ mb: 2 }} />
                <div style={{ position: 'absolute', top: 20, right: 16 }} onClick={() => setShowConfirm(!showConfirm)}>
                  <Image style={{ cursor: 'pointer', color: 'inherit' }} src={showConfirm ? EyeFillSlash : EyeFill} alt={showPassword ? "Hide Password Confirmation" : "Show Password Confirmation"}/>
                </div>
              </div>
            )}
            <Button variant="contained" size="large" style={{ width: '100%'}} type="submit">
              {signup ? "Sign Up with Email" : "Sign In with Email"}
            </Button>
            {!signup && (
              <div style={{ paddingTop: 16 }}>Need an account? <span onClick={() => setSignup(true)} style={{ color: theme.palette.primary.main, cursor: 'pointer' }}>Register here</span></div>
            )}
            {signup && (
              <div style={{ paddingTop: 16 }}>Already have an account? <span onClick={() => setSignup(false)} style={{ color: theme.palette.primary.main, cursor: 'pointer' }}>Sign in here</span></div>
            )}
            </form>
        </Box>
      </Dialog>
    </>
  )
}

export default SignInForm