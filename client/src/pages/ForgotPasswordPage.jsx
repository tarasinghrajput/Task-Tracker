import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import fetchAPI from '../api.js'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [formEmail, setFormEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [sendingOtp, setSendingOtp] = useState(false)
    const [resetting, setResetting] = useState(false)

    const handleSendOtp = async (event) => {
        event.preventDefault()

        if (!formEmail.trim()) {
            toast.error('Email is required')
            return
        }

        setSendingOtp(true)
        try {
            const data = await fetchAPI('/auth/send-reset-otp', {
                method: 'POST',
                body: JSON.stringify({ formEmail }),
            })
            setOtpSent(true)
            toast.success(data.message || 'If this email is registered, you will receive an OTP')
        } catch (error) {
            toast.error(error?.message || 'Failed to send OTP')
        } finally {
            setSendingOtp(false)
        }
    }

    const handleResetPassword = async (event) => {
        event.preventDefault()

        if (!otp.trim()) {
            toast.error('OTP is required')
            return
        }

        if (!newPassword || newPassword.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Password confirmation does not match')
            return
        }

        setResetting(true)
        try {
            const data = await fetchAPI('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ formEmail, otp, newPassword }),
            })
            toast.success(data.message || 'Password reset successful')
            navigate('/login', { replace: true })
        } catch (error) {
            toast.error(error?.message || 'Failed to reset password')
        } finally {
            setResetting(false)
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>Request OTP and set a new password for your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-4" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <Input
                                id="forgot-email"
                                type="email"
                                value={formEmail}
                                onChange={(event) => setFormEmail(event.target.value)}
                                required
                            />
                        </div>

                        {otpSent && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="forgot-otp">OTP</Label>
                                    <Input
                                        id="forgot-otp"
                                        type="text"
                                        value={otp}
                                        onChange={(event) => setOtp(event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="forgot-password">New Password</Label>
                                    <Input
                                        id="forgot-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="forgot-confirm-password">Confirm Password</Label>
                                    <Input
                                        id="forgot-confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={otpSent ? resetting : sendingOtp}>
                            {otpSent
                                ? (resetting ? 'Resetting...' : 'Reset Password')
                                : (sendingOtp ? 'Sending OTP...' : 'Send OTP')}
                        </Button>

                        {otpSent && (
                            <Button type="button" variant="outline" onClick={handleSendOtp} disabled={sendingOtp}>
                                {sendingOtp ? 'Resending OTP...' : 'Resend OTP'}
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ForgotPasswordPage
