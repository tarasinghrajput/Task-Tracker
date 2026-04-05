import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import fetchAPI from '../api.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function EmailVerificationPage() {
    const navigate = useNavigate()
    const hasRequestedOtp = useRef(false)
    const [otp, setOtp] = useState('')
    const [sendingOtp, setSendingOtp] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const { userEmail, refreshAuth } = useAuth()

    const sendOtp = async () => {
        setSendingOtp(true)
        try {
            const data = await fetchAPI('/auth/send-verify-otp', {
                method: 'POST',
            })
            toast.success(data.message || 'Verification OTP sent successfully')
        } catch (error) {
            toast.error(error?.message || 'Failed to send verification OTP')
        } finally {
            setSendingOtp(false)
        }
    }

    useEffect(() => {
        if (hasRequestedOtp.current) {
            return
        }

        hasRequestedOtp.current = true
        sendOtp()
    }, [])

    const handleVerify = async (event) => {
        event.preventDefault()

        if (!/^\d{6}$/.test(otp)) {
            toast.error('Enter a valid 6-digit OTP')
            return
        }

        setVerifying(true)
        try {
            const data = await fetchAPI('/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ otp }),
            })
            toast.success(data.message || 'Email verified successfully')
            await refreshAuth()
            navigate('/', { replace: true })
        } catch (error) {
            toast.error(error?.message || 'OTP verification failed')
        } finally {
            setVerifying(false)
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Verify Your Email</CardTitle>
                    <CardDescription>
                        Enter the OTP sent to <strong>{userEmail || 'your email'}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="verify-otp">6-digit OTP</Label>
                            <Input
                                id="verify-otp"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={verifying}>
                            {verifying ? 'Verifying...' : 'Verify Email'}
                        </Button>
                        <Button type="button" variant="outline" onClick={sendOtp} disabled={sendingOtp}>
                            {sendingOtp ? 'Sending OTP...' : 'Resend OTP'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default EmailVerificationPage
