class Carta:
    """
    Rappresenta una carta da gioco del Blackjack.
    Una carta ha un rango (2-10, J, Q, K, A) e un seme (Cuori, Quadri, Fiori, Picche).
    Nel Blackjack il seme non ha importanza, conta solo il valore della carta.
    """
    
    # Dizionario che associa ogni simbolo della carta al suo valore nel gioco
    # Esempio: '2' vale 2, 'J' (Fante) vale 10, 'A' (Asso) vale 11
    VALORI_RANGO = {
        '2': 2,  '3': 3,  '4': 4,  '5': 5,  '6': 6,  '7': 7, 
        '8': 8,  '9': 9,  'T': 10, 'J': 10, 'Q': 10, 
        'K': 10, 'A': 11
    }

    # NOMI_RANGO = {
    #     '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
    #     '8': '8', '9': '9', 'T': '10', 'J': 'Fante', 'Q': 'Regina',
    #     'K': 'Re', 'A': 'Asso'
    # }
    
    # NOMI_SEME = {
    #     'C': 'Fiori', 'D': 'Quadri',
    #     'H': 'Cuori', 'S': 'Picche'
    # }

    def __init__(self, nome_file):
        """
        Crea una nuova carta partendo dal nome del file dell'immagine.
        
        Args:
            nome_file: nome del file dell'immagine (es: "aH.png" per Asso di Cuori)
                      il primo carattere è il rango, il secondo è il seme
        """
        self.nome_file = nome_file
        # Prendiamo il primo carattere e lo convertiamo in maiuscolo
        # es: da "aH.png" prendiamo "a" e lo facciamo diventare "A"
        self.rango = nome_file[0].upper()
        # Otteniamo il valore numerico dal dizionario VALORI_RANGO
        # Se il rango non esiste nel dizionario, il valore sarà 0
        self.valore = self.VALORI_RANGO.get(self.rango, 0)