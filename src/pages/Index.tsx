import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, PiggyBank, BarChart3, ArrowRight } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <img src="234307512.png" alt="BudgetDock Logo" className="h-9 w-9 object-contain" />
            <span className="font-bold text-lg text-foreground">BD</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>Sign In</Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-2xl mx-auto leading-tight">
            Take Control of Your <span className="text-primary">Finances</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Track income, manage expenses, and plan budgets — all in one simple, free platform.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Start for Free <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: TrendingUp, title: "Track Income & Expenses", desc: "Log every transaction with categories, notes, and recurring schedules." },
              { icon: PiggyBank, title: "Smart Budget Planning", desc: "Set monthly budgets per category and get alerts as you approach limits." },
              { icon: BarChart3, title: "Visual Reports", desc: "Charts and analytics to understand your spending patterns at a glance." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BudgetDock. Free personal budget management.
      </footer>
    </div>
  );
}
