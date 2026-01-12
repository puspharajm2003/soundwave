import React from "react";
import { Navigation } from "@/components/Navigation";
import { Radio as RadioIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const Radio: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState("radio");

    return (
        <div className="min-h-screen bg-background">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="lg:ml-64 pb-40 px-4 md:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/5 border border-indigo-500/20">
                        <RadioIcon className="w-10 h-10 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
                            Radio
                        </h1>
                        <p className="text-muted-foreground">
                            Endless mixes based on your taste
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="glass-card p-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <RadioIcon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Your Flow</h3>
                        <p className="text-muted-foreground">A personalized mix of your favorites and new discoveries.</p>
                        <Button variant="glow" className="w-full">
                            <Play className="w-4 h-4 mr-2" /> Start Listening
                        </Button>
                    </div>
                    {/* Add more radio stations here */}
                </div>
            </main>
        </div>
    );
};

export default Radio;
