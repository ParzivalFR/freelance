import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function SectionCards() {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Revenus totaux</CardDescription>
          <CardTitle className="text-4xl">2,840€</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            +15% par rapport au mois dernier
          </div>
        </CardContent>
        <CardFooter>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="mr-1 size-3" />
            En progression
          </Badge>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Nouveaux clients</CardDescription>
          <CardTitle className="text-4xl">12</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            +4 clients ce mois
          </div>
        </CardContent>
        <CardFooter>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="mr-1 size-3" />
            Croissance
          </Badge>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Projets actifs</CardDescription>
          <CardTitle className="text-4xl">3</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            2 nouveaux projets
          </div>
        </CardContent>
        <CardFooter>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="mr-1 size-3" />
            Actif
          </Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
