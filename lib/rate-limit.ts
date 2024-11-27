// lib/memory-rate-limit.ts

interface RequestLog {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private requests: Map<string, RequestLog>;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 3600000, maxRequests = 5) {
    // 1 heure par défaut
    this.requests = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Nettoyage automatique toutes les heures
    setInterval(() => this.cleanup(), 3600000);
  }

  public check(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Nettoyer les anciennes entrées pour cette IP
    const existingLog = this.requests.get(ip);
    if (existingLog && existingLog.timestamp < windowStart) {
      this.requests.delete(ip);
    }

    // Vérifier et mettre à jour le compteur
    const currentLog = this.requests.get(ip);
    if (!currentLog) {
      this.requests.set(ip, { timestamp: now, count: 1 });
      return true;
    }

    if (currentLog.count >= this.maxRequests) {
      return false;
    }

    // Incrémenter le compteur
    currentLog.count++;
    return true;
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Version corrigée qui évite l'utilisation de for...of sur Map.entries()
    this.requests.forEach((log, ip) => {
      if (log.timestamp < windowStart) {
        this.requests.delete(ip);
      }
    });
  }

  // Méthode optionnelle pour obtenir les statistiques
  public getStats(ip: string) {
    const log = this.requests.get(ip);
    if (!log) return { count: 0, remaining: this.maxRequests };
    return {
      count: log.count,
      remaining: Math.max(0, this.maxRequests - log.count),
    };
  }
}

// Créer une instance unique du rate limiter
export const rateLimiter = new RateLimiter();
