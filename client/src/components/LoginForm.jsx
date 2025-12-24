// import { ToastContainer, toast } from 'react-toastify'
import { useState } from 'react'
import fetchAPI from '../api.js'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

function LoginForm({ className, ...props }) {
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

    const handleLogIn = async (event) => {
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
                const data = await fetchAPI('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ formEmail, formPassword }),
                    credentials: 'include'
                })
            } catch (error) {
                throw new Error('Fetching the API failed', error)
            }
        }
    }


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" id="login-form" onSubmit={handleLogIn}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-muted-foreground text-balance">
                                    Login to your Apnipathshala's Task Tracker account
                                </p>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                            </Field>
                            {errors.email && <p className="text-red-500 text-left">{errors.email}</p>}
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">Forgot your password?</a>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </Field>
                            {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                            <Field>
                                <Button type="submit">Login</Button>
                            </Field>
                            <FieldDescription className="text-center">
                                Don&apos;t have an account? <a href="#">Sign up</a>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="/placeholder.svg"
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>

    )
}

export default LoginForm