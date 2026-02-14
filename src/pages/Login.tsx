import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Stethoscope, User, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [healthStatus, setHealthStatus] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Test backend health check
    try {
      setHealthStatus("Checking backend connection...");
      const response = await fetch("http://localhost:5001/api/health");
      
      if (response.ok) {
        const data = await response.json();
        console.log("Backend health check:", data);
        setHealthStatus("✓ Backend connected successfully!");
      } else {
        setHealthStatus("⚠ Backend responded with error");
        console.error("Backend health check failed:", response.status);
      }
    } catch (error) {
      setHealthStatus("✗ Cannot connect to backend");
      console.error("Backend connection error:", error);
    }
    
    // Continue with login
    const success = login(email, password, role);
    if (success) {
      navigate(role === "doctor" ? "/doctor" : "/patient");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-red-600">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Health Tracker</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-900">Sign In</CardTitle>
            <CardDescription>Choose your role and sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  role === "doctor"
                    ? "border-red-600 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Stethoscope className="h-6 w-6" />
                <span className="text-sm font-medium">Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  role === "patient"
                    ? "border-red-600 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">Patient</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-200 focus:border-red-600 focus:ring-red-600"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700" 
                size="lg"
              >
                Sign In as {role === "doctor" ? "Doctor" : "Patient"}
              </Button>
            </form>

            {/* Health Check Status */}
            {healthStatus && (
              <div className="mt-3 rounded-md bg-gray-50 p-3">
                <p className="text-center text-sm text-gray-700">{healthStatus}</p>
              </div>
            )}

            <p className="mt-4 text-center text-xs text-gray-500">
              Demo mode — any credentials will work
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
