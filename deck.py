import random
from card import Carta

class Mazzo:
    def __init__(self, numero_mazzi=6):
        # Inizializziamo con 6 mazzi come nei casinò reali
        self.numero_mazzi = numero_mazzi
        self.carte = []
        self._crea_mazzo()

    def _crea_mazzo(self):
        """Crea un nuovo mazzo con il numero specificato di mazzi e lo mischia"""
        self.carte = []  # Puliamo il mazzo esistente
        semi = ['C', 'D', 'H', 'S']  # C=Fiori, D=Quadri, H=Cuori, S=Picche
        ranghi = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']
        
        # Creiamo le carte per ogni mazzo
        for _ in range(self.numero_mazzi):
            for seme in semi:
                for rango in ranghi:
                    nome_file = f"{rango}{seme}.png"
                    self.carte.append(Carta(nome_file))
        random.shuffle(self.carte)  # Mischiamo il mazzo

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