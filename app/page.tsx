import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Shield, Users, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Civic Connect</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Report Civic Issues, <span className="text-primary">Make Your City Better</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              A smart platform connecting citizens with local authorities to report, track, and resolve civic issues
              like potholes, water supply problems, garbage collection, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup?role=citizen">Report an Issue</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Track Your Issues</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Report Issues</h3>
                <p className="text-sm text-muted-foreground">
                  Capture photos, add GPS location, and describe the issue in detail
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Auto Assignment</h3>
                <p className="text-sm text-muted-foreground">
                  Issues are automatically assigned to the relevant department
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Get real-time updates and notifications on issue resolution
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">For Different Users</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-lg border bg-card">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Citizens</h3>
                <p className="text-sm text-muted-foreground mb-4">Report issues, track status, and receive updates</p>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/auth/signup?role=citizen">Get Started</Link>
                </Button>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Authorities</h3>
                <p className="text-sm text-muted-foreground mb-4">Manage assigned issues and update progress</p>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/auth/login">Login</Link>
                </Button>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Admins</h3>
                <p className="text-sm text-muted-foreground mb-4">Oversee operations and manage the system</p>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/auth/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Smart Civic Issue Reporting and Management System</p>
        </div>
      </footer>
    </div>
  )
}
