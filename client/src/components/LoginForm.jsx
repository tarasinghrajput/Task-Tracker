import { ToastContainer, toast } from 'react-toastify'
import { useState } from 'react'

function LoginForm() {
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ errors, setErrors ] = useState({})

    function validate(formEmail, formPassword) {
        let tempErrors = {}
        if(!formEmail) tempErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formEmail)) tempErrors.email = 'Email is invalid.'
        if(!formPassword) tempErrors.password = 'Password is required'
        else if(formPassword.length < 8) tempErrors.password = 'Password should be atleast 8 characters'

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

        if(!validate(formEmail, formPassword)) {
            toast.error(`Login unsuccessful`)
        } else {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    body: {email, password},
                })
                if(!response.ok) {
                    console.error("The API failed")
                } else {
                    toast(`Login successful`)
                }
            } catch (error) {
                console.error("Login unsuccessful", error)
            }
        }
    }


    return (
        <section className="loginFormSection">
            <div className="loginFormDiv">
                <form onSubmit={handleSignIn} id="login-form">
                    <label htmlFor="email">
                        Email <br/>
                        <input type="email" name="email" id="email"/>
                        {errors.email && <p style={{color:'red'}}>{errors.email}</p>}
                    </label>
                    <label htmlFor="password">
                        Password <br/>
                        <input type="password" name="password" id="password"/>
                        {errors.password && <p style={{color:'red'}}>{errors.password}</p>}
                    </label>
                    <button>Sign in</button>
                    <ToastContainer/>
                </form>
            </div>
        </section>
    )
}

export default LoginForm