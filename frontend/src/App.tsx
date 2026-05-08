import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { CLIENT_TYPES } from "@preduzetnik/shared"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 bg-background dark">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Preduzetnik Helper</CardTitle>
          <CardDescription>
            Testing FSD, Shadcn, and Shared Library
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Shared Types Test: <span className="font-bold text-foreground">{CLIENT_TYPES[0]}</span>
          </p>
          <Button size="lg" className="w-full">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
