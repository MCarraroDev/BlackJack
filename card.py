class Carta:
    # Dizionario che associa ogni rango al suo valore nel gioco
    # Le figure (J, Q, K) valgono 10, l'Asso vale 11
    VALORI_RANGO = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 
        '8': 8, '9': 9, 'T': 10, 'J': 10, 'Q': 10, 
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
        # nome_file è del tipo "aH.png" dove 'a' è il rango e 'H' è il seme
        self.nome_file = nome_file
        self.rango = nome_file[0].upper()  # Prendiamo solo il primo carattere (il rango)
        self.valore = self.VALORI_RANGO.get(self.rango, 0)  # Otteniamo il valore dal dizionario