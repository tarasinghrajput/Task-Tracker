import { ToastContainer, toast } from 'react-toastify'
import { useState } from 'react'
import fetchAPI from '../api.js'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [successMessage, setSuccessMessage] = useState({})

    function validate(formEmail, formPassword) {
        let tempErrors = {}
        if (!formEmail) tempErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formEmail)) tempErrors.email = 'Email is invalid.'
        if (!formPassword) tempErrors.password = 'Password is required'
        else if (formPassword.length < 8) tempErrors.password = 'Password should be atleast 8 characters'

        setErrors(tempErrors)
        return Object.keys(tempErrors).length === 0
    }

    const handleSignIn = async (event) => {
        event.preventDefault()
        const form = document.getElementById('login-form')
        const formData = new FormData(form)
        const formEmail = formData.get("email")
        const formPassword = formData.get("password")
        setEmail(formEmail)
        setPassword(formPassword)

        if (!validate(formEmail, formPassword)) {
            toast.error(`Login unsuccessful`)
        } else {
            try {
                const data = await fetchAPI('/login', {
                    method: 'POST',
                    body: JSON.stringify({ formEmail, formPassword }),
                    credentials: 'include'
                })
                toast('Login Successfull')
                // setSuccessMessage(data)
            } catch(error) {
                throw new Error('Fetching the API failed', error)
            }
        }
    }


    return (
        <section className="loginFormSection">
            <div className="loginFormDiv">
                <form onSubmit={handleSignIn} id="login-form">
                    <label htmlFor="email">
                        Email <br />
                        <input type="email" name="email" id="email" />
                        {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                    </label>
                    <label htmlFor="password">
                        Password <br />
                        <input type="password" name="password" id="password" />
                        {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                    </label>
                    <button>Sign in</button>
                    {successMessage && <p style={{ color: 'white' }}>{successMessage.message}</p>}
                    <ToastContainer />
                </form>
            </div>
        </section>
    )
}

export default LoginForm