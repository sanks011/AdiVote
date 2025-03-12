"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { getAllCandidates, getElectionSettings, castVote, type Candidate } from "../lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2, Vote, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import CandidateCard from "../components/CandidateCard"
import { toast } from "sonner"

const Voting = () => {
  const { currentUser, userData } = useAuth()
  const navigate = useNavigate()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [candidatesList, electionSettings] = await Promise.all([getAllCandidates(), getElectionSettings()])

        setCandidates(candidatesList)
        setSettings(electionSettings)

        // Calculate total votes
        let votes = 0
        candidatesList.forEach((candidate) => {
          if (candidate.votes) {
            votes += candidate.votes
          }
        })
        setTotalVotes(votes)

        // If user has already voted, select that candidate
        if (userData?.hasVoted && userData?.votedFor) {
          setSelectedCandidate(userData.votedFor)
        }
      } catch (err) {
        setError("Failed to load candidates")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userData])

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate")
      return
    }

    try {
      setSubmitting(true)

      if (!currentUser) {
        throw new Error("You must be logged in to vote")
      }

      const success = await castVote(currentUser.uid, selectedCandidate)

      if (success) {
        toast.success("Your vote has been cast successfully")
        // Navigate to results page if results are visible, otherwise stay on voting page
        if (settings?.resultsVisible) {
          navigate("/results")
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to cast vote")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/50">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
          <h3 className="text-2xl font-medium text-primary">Loading candidates...</h3>
          <p className="text-muted-foreground mt-2">Please wait while we fetch the election data</p>
        </div>
      </div>
    )
  }

  if (!settings?.votingEnabled && !userData?.hasVoted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/50">
        <div className="w-full max-w-lg animate-fade-in-up">
          <Card className="border-2 border-primary/10 shadow-lg">
            <CardHeader className="pb-4">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Info className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Voting Not Available</CardTitle>
              <CardDescription className="text-center text-base mt-2">
                The voting period has not started yet or has ended.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="mb-6 text-muted-foreground">
                Please check back later or contact the election administrator.
              </p>
              <Button onClick={() => navigate("/")} size="lg" className="px-8 transition-all hover:shadow-md">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const selectedCandidateData = candidates.find((c) => c.id === selectedCandidate)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10 animate-fade-in-down">
        <div className="inline-block p-3 bg-primary/10 rounded-full mb-5">
          <Vote size={36} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {userData?.hasVoted ? "Thank You for Voting" : "Cast Your Vote"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          {userData?.hasVoted
            ? "You have already cast your vote. Thank you for participating in this election!"
            : "Select your preferred candidate for the Class Representative position. Your vote matters and can only be cast once."}
        </p>
      </div>

      {error && (
        <div className="animate-fade-in">
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="ml-2">Error</AlertTitle>
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {userData?.hasVoted && !settings?.resultsVisible && (
        <div className="animate-fade-in">
          <Alert className="mb-6 max-w-2xl mx-auto border-2 border-primary/20 bg-primary/5">
            <CheckCircle className="h-5 w-5 text-primary" />
            <AlertTitle className="ml-2">Vote Recorded</AlertTitle>
            <AlertDescription className="ml-2">
              Your vote has been recorded successfully. Results will be available once the voting period ends.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 animate-fade-in">
        {candidates.map((candidate, index) => (
          <div key={candidate.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CandidateCard
              candidate={candidate}
              selectedCandidate={selectedCandidate}
              onSelect={setSelectedCandidate}
              hasVoted={userData?.hasVoted}
              votingEnabled={settings?.votingEnabled}
              showResults={settings?.resultsVisible}
              totalVotes={totalVotes}
            />
          </div>
        ))}
      </div>

      {!userData?.hasVoted && settings?.votingEnabled && (
        <div className="max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <Card className="border-2 border-primary/20 shadow-md p-4">
            <CardContent className="p-0">
              {selectedCandidateData && (
                <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-center font-medium">
                    You are voting for: <span className="text-primary">{selectedCandidateData.name}</span>
                  </p>
                </div>
              )}

              <Button
                className="w-full h-12 text-lg font-medium transition-all"
                size="lg"
                onClick={handleCastVote}
                disabled={!selectedCandidate || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting your vote...
                  </>
                ) : (
                  "Cast Your Vote"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Note: You can only vote once and cannot change your vote after submission.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Voting

