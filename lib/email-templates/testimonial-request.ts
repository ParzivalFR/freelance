interface TestimonialEmailProps {
  clientName: string;
  projectName?: string;
  testimonialUrl: string;
  siteUrl: string;
}

export function createTestimonialEmailTemplate({
  clientName,
  projectName,
  testimonialUrl,
  siteUrl
}: TestimonialEmailProps) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partagez votre expérience</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #0f0f0f;
            background-color: #fafafa;
            padding: 20px 0;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(15, 15, 15, 0.1);
        }
        
        .header {
            padding: 48px 32px 32px;
            text-align: center;
            border-bottom: 1px solid rgba(15, 15, 15, 0.05);
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            color: #0f0f0f;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
        }
        
        .header p {
            color: #737373;
            font-size: 16px;
            font-weight: 400;
        }
        
        .content {
            padding: 32px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 24px;
            color: #0f0f0f;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.7;
            color: #404040;
            margin-bottom: 32px;
        }
        
        .project-highlight {
            background-color: rgba(15, 15, 15, 0.01);
            border: 1px solid rgba(15, 15, 15, 0.1);
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            transition: all 0.3s ease;
        }
        
        .project-highlight:hover {
            background-color: rgba(15, 15, 15, 0.05);
        }
        
        .project-highlight h3 {
            color: #0f0f0f;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .project-highlight p {
            color: #0f0f0f;
            font-weight: 500;
            font-size: 16px;
        }
        
        .cta-container {
            text-align: center;
            margin: 48px 0;
            padding: 40px 24px;
            background-color: rgba(15, 15, 15, 0.01);
            border-radius: 12px;
            border: 1px solid rgba(15, 15, 15, 0.1);
        }
        
        .cta-title {
            font-size: 20px;
            font-weight: 600;
            color: #0f0f0f;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
        }
        
        .cta-subtitle {
            color: #737373;
            margin-bottom: 32px;
            font-size: 14px;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #0f0f0f;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            border: 1px solid #0f0f0f;
        }
        
        .cta-button:hover {
            background-color: #404040;
            transform: translateY(-1px);
        }
        
        .benefits {
            margin: 40px 0;
        }
        
        .benefits-title {
            font-size: 16px;
            font-weight: 600;
            color: #0f0f0f;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .benefit-list {
            list-style: none;
            padding: 0;
        }
        
        .benefit-item {
            padding: 16px 0;
            color: #404040;
            font-size: 14px;
            display: flex;
            align-items: flex-start;
            line-height: 1.6;
        }
        
        .benefit-item::before {
            content: "•";
            color: #0f0f0f;
            font-weight: bold;
            width: 20px;
            margin-right: 8px;
            margin-top: 2px;
            flex-shrink: 0;
        }
        
        .note {
            background-color: rgba(15, 15, 15, 0.01);
            border: 1px solid rgba(15, 15, 15, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
        }
        
        .note p {
            color: #404040;
            font-size: 13px;
            margin: 0;
            line-height: 1.6;
        }
        
        .footer {
            background-color: rgba(15, 15, 15, 0.01);
            border-top: 1px solid rgba(15, 15, 15, 0.1);
            padding: 32px;
            text-align: center;
        }
        
        .footer-brand {
            color: #0f0f0f;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .footer-tagline {
            color: #737373;
            font-size: 13px;
            margin-bottom: 20px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .footer-link {
            color: #0f0f0f;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .footer-link:hover {
            color: #404040;
        }
        
        .footer-disclaimer {
            font-size: 11px;
            color: #737373;
            line-height: 1.5;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(15, 15, 15, 0.1);
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .container {
                margin: 0;
                border-radius: 8px;
            }
            
            .header {
                padding: 32px 24px 24px;
            }
            
            .content {
                padding: 24px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-container {
                padding: 32px 20px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Partagez votre expérience</h1>
            <p>Votre avis compte pour nous</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Bonjour ${clientName},
            </div>
            
            <div class="message">
                J'espère que vous êtes satisfait${projectName ? ` de notre collaboration sur le projet <strong>"${projectName}"</strong>` : ' de nos services'}. Votre retour est précieux pour nous aider à maintenir la qualité de nos prestations et rassurer nos futurs clients.
            </div>
            
            ${projectName ? `
            <div class="project-highlight">
                <h3>Projet réalisé</h3>
                <p>${projectName}</p>
            </div>
            ` : ''}
            
            <div class="cta-container">
                <div class="cta-title">Laisser votre avis</div>
                <div class="cta-subtitle">Cela ne prendra que quelques minutes</div>
                <a href="${testimonialUrl}" class="cta-button">
                    Partager mon expérience
                </a>
            </div>
            
            <div class="benefits">
                <div class="benefits-title">Votre témoignage nous aide à :</div>
                <ul class="benefit-list">
                    <li class="benefit-item">Améliorer continuellement nos services</li>
                    <li class="benefit-item">Rassurer nos futurs clients</li>
                    <li class="benefit-item">Valoriser notre expertise</li>
                    <li class="benefit-item">Construire une relation de confiance</li>
                </ul>
            </div>
            
            <div class="note">
                <p>
                    <strong>Important :</strong> Ce lien est personnel et sécurisé. Il ne peut être utilisé qu'une seule fois et expire dans 30 jours.
                </p>
            </div>
            
            <div class="message">
                Si vous avez des questions, n'hésitez pas à me répondre directement à cet email.
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-brand">Gael Richard</div>
            <div class="footer-tagline">Développeur Freelance</div>
            <div class="footer-links">
                <a href="${siteUrl}" class="footer-link">Portfolio</a>
                <a href="mailto:hello@gael-dev.fr" class="footer-link">Contact</a>
            </div>
            <div class="footer-disclaimer">
                Vous recevez cet email car vous avez récemment fait appel à nos services. 
                Cet email concerne uniquement votre expérience client.
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}

export function createTestimonialEmailSubject(clientName: string, projectName?: string): string {
  return `${clientName}, partagez votre expérience${projectName ? ` - ${projectName}` : ''} 🌟`;
}