class Carta:
    VALORI_RANGO = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 
        '8': 8, '9': 9, 'T': 10, 'J': 10, 'Q': 10, 
        'K': 10, 'A': 11
    }
    
    NOMI_RANGO = {
        '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
        '8': '8', '9': '9', 'T': '10', 'J': 'Fante', 'Q': 'Regina',
        'K': 'Re', 'A': 'Asso'
    }
    
    NOMI_SEME = {
        'C': 'Fiori', 'D': 'Quadri',
        'H': 'Cuori', 'S': 'Picche'
    }

    def __init__(self, nome_file):
        self.nome_file = nome_file
        self.rango = nome_file[0].upper()
        self.seme = nome_file[1].upper()
        self.valore = self.VALORI_RANGO.get(self.rango, 0)

    def ottieni_nome_rango(self):
        return self.NOMI_RANGO[self.rango]

    def ottieni_nome_seme(self):
        return self.NOMI_SEME[self.seme]