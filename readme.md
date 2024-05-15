# Guide d’utilisation de l’extension SoundCloud Playlist

> Note: Afin d'utiliser l'extension, vous devez être connecté à un compte Soundcloud durant son fonctionnement.

## Installation

__ATTENTION__: Avant d'installer l'extension, vérifiez que vous ne l'avez pas déjà installé. Et si c'est le cas, supprimez la version déjà installé de vos extension.

1. En haut à droite de ce repo Github, cliquez sur le bouton vert (annoté `Code`), puis cliquez sur `Download` (ou `Télécharger`)
2. Dézippez le fichier que vous venez de télécharger
   * Sur Mac, double cliquez sur le fichier dans le Finder
   * Sur Windows, faites click-droit, `Extraire tout...` puis dans la fenètre qui s'est ouverte appuyez sur `Extraire`
3. Rendez-vous désormais dans votre navigateur (Chrome ou autre) et dans le menu `Extensions` cliquez sur `Gérer les extensions`
4. En haut à droite de la fenêtre qui s'est ouverte cliquez sur `Mode développeur` (afin de l'activer)
5. Puis appuyez sur le bouton `Charger les extensions non empaquetée` qui est apparu en haut à droite
6. Séléctionnez désormais le dossier que vous venez de décompresser
7. Ouvrez le lien de votre playlist sur Soundcloud et Tadaaam : le "skipper" est actif

## Fonctionnalités

Pour modifier les paramètres de l'extension, cliquez sur l'icône se trouvant dans votre barre des extensions.

### Enable auto skipping

Si l'extension est active ou non. Par défaut cette option est à `oui`.

### Start playing on launch

Si cette option est active, dès lors que vous lancez Soundcloud l'extension va tenté d'automatiquement reprendre la lecture.
Cette fonctionnalité peut ne pas fonctionner car certaines fois bloqué par Soundcloud.
Par défaut cette option est à `oui`.

### Skip timeout

Cette valeur correspond au temps moyen en secondes qui va être laissé avant de passer la musique. Par défaut cette valeur est à `35`.
> Note : La valeur minimum pour ce paramètre est `5` et la valeur maxium est `60`

### Randomness

Cette valeur permet de gérer l'aléatoire de passage des musiques. Plus cette valeur est grande, plus l'interval de temps de passage entre une musique et une autre sera grande.
Derrière, le temps qui va être aloué à une musique sera:

* _Temps Minimum_: <[skip_timeout](#skip-timeout)> __-__ <[randomness](#randomness)>
* _Temps Maximum_: <[skip_timeout](#skip-timeout)> __+__ <[randomness](#randomness)>

Par défaut cette valeur est à `5`.
> Note : La valeur minimum pour ce paramètre est `0` et la valeur maxium est `30`
