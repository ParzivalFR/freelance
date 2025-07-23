# Configuration de l'authentification SMTP pour Gmail

## Problème

L'erreur `535-5.7.8 Username and Password not accepted` se produit lors de l'envoi d'emails via SMTP Gmail. Cette erreur est due aux nouvelles politiques de sécurité de Google qui n'accepte plus l'authentification simple avec le mot de passe du compte, surtout si l'authentification à deux facteurs est activée.

## Solution

Pour résoudre ce problème, vous devez configurer un **mot de passe d'application** spécifique pour l'authentification SMTP. Voici comment procéder :

### Étape 1 : Activer l'authentification à deux facteurs

1. Accédez à [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Connectez-vous à votre compte Gmail
3. Recherchez l'option "Validation en deux étapes" et activez-la
4. Suivez les instructions à l'écran pour configurer l'authentification à deux facteurs

### Étape 2 : Générer un mot de passe d'application

1. Accédez à [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Connectez-vous à votre compte Gmail (si ce n'est pas déjà fait)
3. Dans la section "Sélectionner une application", choisissez "Autre (nom personnalisé)"
4. Donnez un nom à votre application (par exemple, "Freelance SMTP")
5. Cliquez sur le bouton "Générer"
6. Un mot de passe d'application unique sera généré
7. Copiez ce mot de passe

### Étape 3 : Mettre à jour le fichier .env

Remplacez la valeur de `EMAIL_PASSWORD` dans votre fichier `.env` par le mot de passe d'application généré :

```
ADMIN_EMAIL=hello@gael-dev.fr
EMAIL_PASSWORD=votre_mot_de_passe_d_application
```

## Remarques importantes

- Le mot de passe d'application est une chaîne de 16 caractères sans espaces
- Vous n'aurez pas besoin de le saisir à nouveau, alors conservez-le en lieu sûr
- Si vous rencontrez toujours des problèmes, vérifiez que l'adresse email utilisée (`ADMIN_EMAIL`) est bien celle pour laquelle vous avez généré le mot de passe d'application
- Assurez-vous que le port SMTP (587) n'est pas bloqué par un pare-feu

## Ressources supplémentaires

- [Documentation officielle Google sur les mots de passe d'application](https://support.google.com/accounts/answer/185833)
- [Résolution des problèmes SMTP avec Gmail](https://support.google.com/mail/answer/7126229)