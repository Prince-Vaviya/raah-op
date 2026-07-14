"use client";

import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConductorsPage() {
  const [conductors, setConductors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busAssignments, setBusAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConductors();
  }, []);

  const fetchConductors = async () => {
    setLoading(true);
    try {
      // In real prod, operator token is needed
      const res = await fetch('http://localhost:4000/api/operators/verifications?status=PENDING');
      if (res.ok) {
        const data = await res.json();
        setConductors(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, licenseNumber: string) => {
    const busNumber = busAssignments[id];
    if (!busNumber) {
      alert('Please assign a bus number first');
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/operators/verifications/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED', busNumber })
      });
      if (res.ok) {
        alert('Conductor approved and assigned to ' + busNumber);
        fetchConductors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/operators/verifications/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', busNumber: '' })
      });
      if (res.ok) {
        alert('Conductor rejected');
        fetchConductors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conductor Verifications</h1>
          <p className="text-muted-foreground mt-1">Approve pending conductors and assign them to active buses.</p>
        </div>
        <Button onClick={fetchConductors} variant="outline">Refresh</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : conductors.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pending verifications.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conductors.map(c => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{c.name || c.email}</CardTitle>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <CardDescription>Requested on {new Date(c.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Provided License</p>
                  <div className="font-mono text-sm bg-muted p-2 rounded">{c.licenseNumber}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Assign Bus Number</p>
                  <Input 
                    placeholder="e.g. KA-BUS-4821" 
                    value={busAssignments[c.id] !== undefined ? busAssignments[c.id] : (c.assignedBusNumber || '')}
                    onChange={(e) => setBusAssignments({...busAssignments, [c.id]: e.target.value})}
                  />
                  {c.assignedBusNumber && busAssignments[c.id] === undefined && (
                    <p className="text-xs text-muted-foreground mt-1">Conductor requested: {c.assignedBusNumber}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(c.id, c.licenseNumber)}>
                    Approve
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleReject(c.id)}>
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
