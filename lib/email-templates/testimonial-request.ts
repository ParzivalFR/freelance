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
    <title>Partagez votre expérience avec nous</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.7;
            color: #4a5568;
            margin-bottom: 30px;
        }
        
        .project-highlight {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .project-highlight h3 {
            color: #2d3748;
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .project-highlight p {
            color: #667eea;
            font-weight: 600;
        }
        
        .cta-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
        
        .features {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .features h3 {
            color: #2d3748;
            font-size: 16px;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
        }
        
        .feature-list li {
            padding: 8px 0;
            color: #4a5568;
            display: flex;
            align-items: center;
        }
        
        .feature-list li:before {
            content: "✓";
            background-color: #48bb78;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .note {
            background-color: #fef5e7;
            border: 1px solid #f6e05e;
            border-radius: 6px;
            padding: 16px;
            margin: 25px 0;
        }
        
        .note p {
            color: #744210;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 30px;
            text-align: center;
        }
        
        .footer h4 {
            color: white;
            margin-bottom: 15px;
        }
        
        .footer p {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 10px;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌟 Votre avis compte pour nous</h1>
            <p>Aidez-nous à nous améliorer en partageant votre expérience</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Bonjour ${clientName},
            </div>
            
            <div class="message">
                J'espère que vous êtes pleinement satisfait${projectName ? ` de notre collaboration sur le projet <strong>"${projectName}"</strong>` : ' de nos services'}. 
                Votre retour est précieux pour nous aider à maintenir la qualité de nos prestations.
            </div>
            
            ${projectName ? `
            <div class="project-highlight">
                <h3>📋 Projet réalisé</h3>
                <p>${projectName}</p>
            </div>
            ` : ''}
            
            <div class="features">
                <h3>Votre témoignage nous permet de :</h3>
                <ul class="feature-list">
                    <li>Améliorer continuellement nos services</li>
                    <li>Rassurer nos futurs clients</li>
                    <li>Valoriser notre expertise</li>
                    <li>Construire une relation de confiance</li>
                </ul>
            </div>
            
            <div class="cta-container">
                <a href="${testimonialUrl}" class="cta-button">
                    ✍️ Laisser mon avis (2 minutes)
                </a>
            </div>
            
            <div class="note">
                <p>
                    <strong>Important :</strong> Ce lien est personnel et sécurisé. Il ne peut être utilisé qu'une seule fois et expire automatiquement dans 30 jours.
                </p>
            </div>
            
            <div class="message">
                Si vous avez des questions ou souhaitez discuter de votre expérience avant de laisser votre avis, 
                n'hésitez pas à me répondre directement à cet email.
            </div>
        </div>
        
        <div class="footer">
            <h4>Gael Richard - Développeur Freelance</h4>
            <p>Spécialisé dans le développement web moderne</p>
            <p>
                <a href="${siteUrl}">🌐 ${siteUrl.replace('https://', '')}</a> • 
                <a href="mailto:hello@gael-dev.fr">✉️ hello@gael-dev.fr</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #718096;">
                Vous recevez cet email car vous avez récemment fait appel à nos services. 
                Cet email concerne uniquement votre expérience client.
            </p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

export function createTestimonialEmailSubject(clientName: string, projectName?: string): string {
  return `${clientName}, partagez votre expérience${projectName ? ` - ${projectName}` : ''} 🌟`;
}