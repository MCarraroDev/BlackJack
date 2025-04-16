import random
from card import Carta

class Mazzo:
    """
    Rappresenta un mazzo di carte da gioco per il Blackjack.
    Nel Blackjack da casinò si usano tipicamente 6 mazzi mescolati insieme
    per rendere più difficile il conteggio delle carte.
    """
    
    def __init__(self, numero_mazzi=6):
        """
        Crea un nuovo mazzo con il numero specificato di mazzi standard.
        
        Args:
            numero_mazzi: numero di mazzi da 52 carte da usare (default: 6)
        """
        self.numero_mazzi = numero_mazzi
        self.carte = []
        self._crea_mazzo()  # Il _ indica che questo è un metodo "privato"

    def _crea_mazzo(self):
        """
        Crea e mischia un nuovo mazzo completo.
        Questo è un metodo privato (inizia con _) usato internamente dalla classe.
        """
        self.carte = []  # Puliamo il mazzo esistente
        
        # C=Fiori, D=Quadri, H=Cuori, S=Picche
        semi = ['C', 'D', 'H', 'S']
        
        # 2-9=normali, t=10, j=fante, q=regina, k=re, a=asso
        ranghi = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']
        
        # Creiamo le carte per ogni mazzo
        for _ in range(self.numero_mazzi):  # Per ogni mazzo
            for seme in semi:               # Per ogni seme
                for rango in ranghi:        # Per ogni rango
                    nome_file = f"{rango}{seme}.png"
                    self.carte.append(Carta(nome_file))
        
        # Mischiamo tutte le carte
        random.shuffle(self.carte)

    def mischia(self):
        """
        Mischia tutte le carte nel mazzo.
        Se il mazzo è vuoto, ne crea uno nuovo.
        """
        if not self.carte:
            self._crea_mazzo()
        else:
            random.shuffle(self.carte)

    def dai_carta(self):
        """
        Estrae e restituisce la carta in cima al mazzo.
        Se il mazzo è vuoto, ne crea uno nuovo prima di dare la carta.
        
        Returns:
            Carta: la carta estratta dal mazzo
            None: se c'è stato un problema nel creare un nuovo mazzo
        """
        if not self.carte:
            self._crea_mazzo()
        return self.carte.pop() if self.carte else None
        # Il metodo `pop()` viene utilizzato per rimuovere e restituire l'ultimo elemento della lista `carte`.
        # Se la lista è vuota, `pop()` non viene chiamato, evitando un'eccezione.
        
        
    def carte_rimanenti(self):
        """Dice quante carte sono rimaste nel mazzo"""
        return len(self.carte)