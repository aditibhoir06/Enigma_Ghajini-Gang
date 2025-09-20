import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, MapPin, Calendar, Mic } from "lucide-react";
import { useVoiceNavigationContext } from "@/components/VoiceNavigationProvider";
import { useVoiceForm } from "@/hooks/useVoiceForm";
import { VoiceHelpDialog } from "@/components/VoiceHelpDialog";
import { toast } from "sonner";

interface SchemeData {
  name: string;
  benefits: string;
  eligibility: string;
  category: string;
}

const mockSchemes: SchemeData[] = [
  {
    name: "PM Kisan Samman Nidhi",
    benefits: "₹6,000 per year in 3 installments",
    eligibility: "Small & marginal farmers with landholding up to 2 hectares",
    category: "Agriculture"
  },
  {
    name: "Pradhan Mantri Ujjwala Yojana",
    benefits: "Free LPG connection + ₹1,600 advance for gas stove",
    eligibility: "Women from BPL households",
    category: "Energy"
  },
  {
    name: "Ayushman Bharat",
    benefits: "Health insurance cover of ₹5 lakh per family per year",
    eligibility: "Families as per SECC database",
    category: "Healthcare"
  }
];

export default function Schemes() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    state: "",
    category: ""
  });
  const [showResults, setShowResults] = useState(false);
  const { speak } = useVoiceNavigationContext();

  // Voice form processing - defined before use
  const processVoiceInput = (transcript: string) => {
    const text = transcript.toLowerCase().trim();

    // Age processing
    const ageMatch = text.match(/(?:i am |my age is |age )?(\d{1,3})(?: years old| years)?/);
    if (ageMatch) {
      const age = ageMatch[1];
      if (parseInt(age) >= 1 && parseInt(age) <= 120) {
        setFormData(prev => ({ ...prev, age }));
        speak(`Age set to ${age} years`);
        return true;
      }
    }

    // Gender processing
    if (text.includes('male') && !text.includes('female')) {
      setFormData(prev => ({ ...prev, gender: 'male' }));
      speak('Gender set to male');
      return true;
    }
    if (text.includes('female')) {
      setFormData(prev => ({ ...prev, gender: 'female' }));
      speak('Gender set to female');
      return true;
    }
    if (text.includes('other')) {
      setFormData(prev => ({ ...prev, gender: 'other' }));
      speak('Gender set to other');
      return true;
    }

    // State processing
    const stateMap: { [key: string]: string } = {
      'andhra pradesh': 'andhra-pradesh',
      'bihar': 'bihar',
      'gujarat': 'gujarat',
      'karnataka': 'karnataka',
      'maharashtra': 'maharashtra',
      'uttar pradesh': 'uttar-pradesh',
      'west bengal': 'west-bengal'
    };

    for (const [stateName, stateValue] of Object.entries(stateMap)) {
      if (text.includes(stateName)) {
        setFormData(prev => ({ ...prev, state: stateValue }));
        speak(`State set to ${stateName}`);
        return true;
      }
    }

    // Category processing
    if (text.includes('general')) {
      setFormData(prev => ({ ...prev, category: 'general' }));
      speak('Category set to general');
      return true;
    }
    if (text.includes('sc') || text.includes('scheduled caste')) {
      setFormData(prev => ({ ...prev, category: 'sc' }));
      speak('Category set to SC');
      return true;
    }
    if (text.includes('st') || text.includes('scheduled tribe')) {
      setFormData(prev => ({ ...prev, category: 'st' }));
      speak('Category set to ST');
      return true;
    }
    if (text.includes('obc') || text.includes('other backward class')) {
      setFormData(prev => ({ ...prev, category: 'obc' }));
      speak('Category set to OBC');
      return true;
    }

    // Form submission
    if (text.includes('submit') || text.includes('find schemes') || text.includes('search schemes')) {
      if (formData.age && formData.gender && formData.state) {
        setShowResults(true);
        speak('Finding personalized schemes for you');
        return true;
      } else {
        speak('Please fill all required fields first: age, gender, and state');
        return true;
      }
    }

    // Clear form
    if (text.includes('clear form') || text.includes('reset form')) {
      resetForm();
      return true;
    }

    return false;
  };

  // Voice form integration
  const { isListening, isSupported, startListening, stopListening } = useVoiceForm({
    onVoiceInput: processVoiceInput,
    enabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    speak('Finding personalized schemes for you. Please wait.');
  };

  const resetForm = () => {
    setFormData({ age: "", gender: "", state: "", category: "" });
    setShowResults(false);
    speak('Form reset. You can now enter your details again.');
  };

  // Announce results when they are shown
  useEffect(() => {
    if (showResults) {
      speak(`Found ${mockSchemes.length} government schemes for you. The first scheme is ${mockSchemes[0]?.name}.`);
    }
  }, [showResults, speak]);

  if (showResults) {
    return (
      <div className="min-h-screen p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recommended Schemes</h1>
            <p className="text-muted-foreground">Based on your profile</p>
          </div>
          <Button onClick={resetForm} variant="outline" size="sm">
            New Search
          </Button>
        </div>

        <div className="space-y-4">
          {mockSchemes.map((scheme, index) => (
            <Card key={index} className="shadow-card border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg text-foreground">{scheme.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {scheme.category}
                    </Badge>
                  </div>
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-success mb-1">Benefits:</h4>
                  <p className="text-sm text-foreground">{scheme.benefits}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-primary mb-1">Eligibility:</h4>
                  <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                </div>
                <Button className="w-full bg-gradient-primary hover:opacity-90" size="sm">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Find Government Schemes</h1>
        <p className="text-muted-foreground">
          Tell us about yourself to get personalized scheme recommendations
        </p>
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium mb-2">💬 Voice Commands Available:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• "I am 25 years old" - Set age</p>
            <p>• "I am male/female" - Set gender</p>
            <p>• "I am from Maharashtra" - Set state</p>
            <p>• "Submit form" - Find schemes</p>
          </div>
          <div className="mt-2">
            <VoiceHelpDialog />
          </div>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Details</CardTitle>
              <CardDescription>This helps us recommend the right schemes for you</CardDescription>
            </div>
            {isSupported && (
              <Button
                type="button"
                variant={isListening ? "default" : "outline"}
                size="sm"
                onClick={isListening ? stopListening : startListening}
                className={isListening ? "bg-financial text-financial-foreground animate-pulse" : ""}
              >
                <Mic className="h-4 w-4 mr-2" />
                {isListening ? "Stop Voice" : "Voice Input"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium">Age</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  className="pl-10"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">State</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select 
                  value={formData.state} 
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                    <SelectItem value="bihar">Bihar</SelectItem>
                    <SelectItem value="gujarat">Gujarat</SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                    <SelectItem value="west-bengal">West Bengal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category (Optional)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                    <SelectItem value="obc">OBC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={!formData.age || !formData.gender || !formData.state}
            >
              Find Schemes for Me
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}