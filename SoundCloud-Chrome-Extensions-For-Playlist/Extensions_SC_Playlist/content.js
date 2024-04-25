console.log('content running');

const bouton = document.querySelector('.repeatControl.sc-ir.m-none');

bouton.click()
bouton.click()


// Fonction pour rechercher et cliquer sur le bouton
function cliquerSurBouton() {
    // Trouver le bouton par sa classe
    const bouton = document.querySelector('.skipControl.sc-ir.playControls__control.playControls__next.skipControl__next');
    const nombreAleatoire = Math.floor(Math.random() * (36000 - 30000 + 1)) + 34000;
    // Vérifier si le bouton a été trouvé
    if (bouton) {
        // Simuler un clic sur le bouton
        bouton.click();
    } else {
        console.error("Le bouton n'a pas été trouvé.");
    }

    // Appeler la fonction cliquerSurBouton à nouveau après un délai de 3 secondes
    setTimeout(cliquerSurBouton, nombreAleatoire);
}

// Démarrer la boucle en appelant la fonction une première fois
cliquerSurBouton();
