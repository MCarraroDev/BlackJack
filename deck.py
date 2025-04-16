import random
from card import Carta

class Mazzo:
    def __init__(self, numero_mazzi=6):
        self.numero_mazzi = numero_mazzi
        self.carte = []
        self._crea_mazzo()
        self.mischia()

    def _crea_mazzo(self):
        semi = ['C', 'D', 'H', 'S']
        ranghi = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']
        
        for _ in range(self.numero_mazzi):
            for seme in semi:
                for rango in ranghi:
                    nome_file = f"{rango}{seme}.png"
                    self.carte.append(Carta(nome_file))
        self.mischia()

    def mischia(self):
        if not self.carte:
            self._crea_mazzo()
        random.shuffle(self.carte)

    def dai_carta(self):
        if not self.carte:
            self.mischia()
        return self.carte.pop() if self.carte else None

    def carte_rimanenti(self):
        return len(self.carte)