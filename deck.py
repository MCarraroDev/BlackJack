import random
from card import Carta

class Mazzo:
    def __init__(self, numero_mazzi=6):
        self.numero_mazzi = numero_mazzi
        self.carte = []
        self._crea_mazzo()

    def _crea_mazzo(self):
        """
        Crea un nuovo mazzo con il numero specificato di mazzi.
        Questa è una funzione privata (inizia con _) e dovrebbe essere chiamata
        solo all'interno della classe Mazzo.
        """
        
        self.carte = []  # Puliamo il mazzo esistente
        semi = ['C', 'D', 'H', 'S']
        ranghi = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']
        
        for _ in range(self.numero_mazzi):
            for seme in semi:
                for rango in ranghi:
                    nome_file = f"{rango}{seme}.png"
                    self.carte.append(Carta(nome_file))
        random.shuffle(self.carte)  # Mischiamo il mazzo appena creato

    def mischia(self):
        """Mischia le carte o crea un nuovo mazzo se è vuoto"""
        if not self.carte:
            self._crea_mazzo()
        else:
            random.shuffle(self.carte)

    def dai_carta(self):
        """Dà una carta dal mazzo, se vuoto ne crea uno nuovo"""
        if not self.carte:
            self._crea_mazzo()
        return self.carte.pop() if self.carte else None

    def carte_rimanenti(self):
        """Dice quante carte sono rimaste nel mazzo"""
        return len(self.carte)