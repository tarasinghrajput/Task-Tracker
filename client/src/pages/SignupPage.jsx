import SignupForm from '../components/SignupForm'
import OtpForm from '../components/OtpForm'
import { Spinner } from "@/components/ui/spinner"

function SignupPage() {

    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <SignupForm />
            </div>
        </div>
    )
}

export default SignupPage