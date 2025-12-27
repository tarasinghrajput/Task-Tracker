import { useEffect, useState } from 'react'
import fetchAPI from '../api.js'
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SCRIPT_SNIPPET = `function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  if (!payload || payload.action !== 'appendTasks') {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Invalid payload' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(payload.sheetName);
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const rows = payload.tasks.map(function(task) {
    return [
      task.taskIdentifier,
      task.taskDate,
      task.taskTimeElapsed,
      task.taskCategory,
      task.taskType,
      task.taskTitle,
      task.taskDescription,
      task.taskPriority,
      task.taskStatus,
      task.impactArea,
      task.impactLevel,
      task.issueSource,
      task.toolsInvolved,
      task.createdAt,
    ];
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}`

function SettingsPage() {
    const [sheetConfig, setSheetConfig] = useState(null)
    const [formData, setFormData] = useState({
        displayName: '',
        spreadsheetId: '',
        sheetName: '',
        sheetURL: '',
        appsScriptUrl: '',
    })
    const [unsyncedCount, setUnsyncedCount] = useState(0)
    const [connecting, setConnecting] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [showScriptGuide, setShowScriptGuide] = useState(false)

    const fetchSheetConfig = async () => {
        try {
            const data = await fetchAPI('/sheets/config', { method: 'GET' })
            if (data.sheet) {
                setSheetConfig(data.sheet)
                setFormData({
                    displayName: data.sheet.name || '',
                    spreadsheetId: data.sheet.spreadsheetId || '',
                    sheetName: data.sheet.sheetName || '',
                    sheetURL: data.sheet.sheetURL || '',
                    appsScriptUrl: data.sheet.appsScriptUrl || '',
                })
            } else {
                setSheetConfig(null)
            }
        } catch (error) {
            toast.error(error?.message || 'Unable to fetch sheet configuration')
        }
    }

    const fetchUnsyncedCount = async () => {
        try {
            const data = await fetchAPI('/task/get-tasks', { method: 'GET' })
            const pending = (data.tasks || []).filter((task) => !task.isSyncedToSheet).length
            setUnsyncedCount(pending)
        } catch (error) {
            toast.error(error?.message || 'Unable to fetch tasks for sync status')
        }
    }

    useEffect(() => {
        fetchSheetConfig()
        fetchUnsyncedCount()
    }, [])

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleConnectSheet = async (event) => {
        event.preventDefault()
        setConnecting(true)

        try {
            const payload = {
                displayName: formData.displayName,
                spreadsheetId: formData.spreadsheetId,
                sheetName: formData.sheetName,
                sheetURL: formData.sheetURL,
                appsScriptUrl: formData.appsScriptUrl,
            }

            const data = await fetchAPI('/sheets/connect', {
                method: 'POST',
                body: JSON.stringify(payload),
            })

            setSheetConfig(data.sheet)
            toast.success(data.message || 'Google Sheet connected successfully')
        } catch (error) {
            toast.error(error?.message || 'Failed to connect Google Sheet')
        } finally {
            setConnecting(false)
        }
    }

    const handleSyncPending = async () => {
        setSyncing(true)
        try {
            const data = await fetchAPI('/sheets/sync-pending', {
                method: 'POST',
            })
            toast.success(data.message || 'Tasks synced successfully')
            fetchUnsyncedCount()
        } catch (error) {
            toast.error(error?.message || 'Failed to sync tasks')
        } finally {
            setSyncing(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-semibold mb-2">Settings</h1>
                <p className="text-muted-foreground">Connect Google Sheets and manage task sync status.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Google Sheets Connection</CardTitle>
                        <CardDescription>Provide the spreadsheet ID and tab name to log tasks automatically.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4" onSubmit={handleConnectSheet}>
                            <div>
                                <Label htmlFor="displayName">Connection Name</Label>
                                <Input
                                    id="displayName"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    placeholder="Marketing Task Log"
                                />
                            </div>
                            <div>
                                <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
                                <Input
                                    id="spreadsheetId"
                                    name="spreadsheetId"
                                    value={formData.spreadsheetId}
                                    onChange={handleInputChange}
                                    placeholder="1AbC..."
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="sheetName">Sheet Tab Name</Label>
                                <Input
                                    id="sheetName"
                                    name="sheetName"
                                    value={formData.sheetName}
                                    onChange={handleInputChange}
                                    placeholder="Tasks"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="sheetURL">Sheet URL (optional)</Label>
                                <Input
                                    id="sheetURL"
                                    name="sheetURL"
                                    value={formData.sheetURL}
                                    onChange={handleInputChange}
                                    placeholder="https://docs.google.com/..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="appsScriptUrl">Apps Script Web App URL</Label>
                                <Input
                                    id="appsScriptUrl"
                                    name="appsScriptUrl"
                                    value={formData.appsScriptUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://script.google.com/macros/s/.../exec"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={connecting}>
                                {connecting ? 'Connecting...' : sheetConfig ? 'Update Connection' : 'Connect Sheet'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sync Status</CardTitle>
                        <CardDescription>Monitor and trigger sync for tasks that have not reached Google Sheets yet.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Unsynced tasks</p>
                                <p className="text-3xl font-semibold">{unsyncedCount}</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={fetchUnsyncedCount}
                            >
                                Refresh
                            </Button>
                        </div>
                        <div className="rounded-lg border p-4 bg-slate-50">
                            <p className="text-sm font-medium mb-1">Current Sheet</p>
                            {sheetConfig ? (
                                <>
                                    <p className="text-base font-semibold">{sheetConfig.name}</p>
                                    <p className="text-sm text-muted-foreground break-all">{sheetConfig.sheetURL}</p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No sheet connected yet.</p>
                            )}
                        </div>
                        <Button
                            onClick={handleSyncPending}
                            disabled={unsyncedCount === 0 || syncing}
                        >
                            {syncing ? 'Syncing...' : 'Sync Pending Tasks'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>Apps Script Setup</CardTitle>
                            <CardDescription>Deploy a Web App inside your spreadsheet to receive task payloads.</CardDescription>
                        </div>
                        <Button type="button" variant="outline" onClick={() => setShowScriptGuide((prev) => !prev)}>
                            {showScriptGuide ? 'Hide Guide' : 'Show Guide'}
                        </Button>
                    </CardHeader>
                    {showScriptGuide && (
                        <CardContent className="flex flex-col gap-4">
                            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                <li>Open your Google Sheet and go to <strong>Extensions → Apps Script</strong>.</li>
                                <li>Replace the default code with the snippet below.</li>
                                <li>Click <strong>Deploy → New deployment</strong>, choose <strong>Web app</strong>, set access to <strong>Anyone</strong>, and deploy.</li>
                                <li>Copy the Web App URL and paste it into the “Apps Script Web App URL” field above.</li>
                            </ol>
                            <div className="rounded-lg border bg-slate-950 text-slate-50 p-4 text-sm overflow-auto">
                                <pre className="whitespace-pre-wrap">
                                    <code>{SCRIPT_SNIPPET}</code>
                                </pre>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(SCRIPT_SNIPPET)
                                        toast.success('Apps Script copied to clipboard')
                                    }}
                                >
                                    Copy Script
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default SettingsPage
