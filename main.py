"""
Gioco del Blackjack implementato con interfaccia grafica Tkinter.
Il gioco segue le regole standard del Blackjack da casinò:
- Il banco deve pescare su 16 e stare su 17
- L'Asso vale 11, ma diventa 1 se si supera 21
- Si usano 6 mazzi di carte
"""

import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
from deck import Mazzo

class GiocoBlackjack:
    """
    Classe principale che gestisce il gioco del Blackjack.
    Gestisce l'interfaccia grafica e la logica di gioco.
    """
    
    PERCORSO_RETRO_CARTA = "assets/r88_Casino/img/cards/cardBack.png"
    PERCORSO_CARTE = "assets/r88_Casino/img/cards"
    PUNTEGGIO_MINIMO_BANCO = 17
    COLORE_SFONDO = "#233b30"  # Verde scuro del tavolo

    def __init__(self, root):
        """Inizializza il gioco del Blackjack."""
        self.root = root
        self.root.title("Blackjack")
        self.root.geometry("1280x720")
        self.root.resizable(False, False)
        
        # Base UI setup
        self.sfondo = tk.Label(root, bg=self.COLORE_SFONDO)
        self.sfondo.place(x=0, y=0, relwidth=1, relheight=1)
        
        if not self.carica_immagini_carte():
            return
            
        self.frame_principale = tk.Frame(root, bg=self.COLORE_SFONDO)
        self.frame_principale.pack(fill="both", expand=True)
        
        self.setup_ui()
        self.inizia_nuova_partita()

    def carica_immagini_carte(self):
        """Carica le immagini delle carte."""
        try:
            self.retro_carta = ImageTk.PhotoImage(Image.open(self.PERCORSO_RETRO_CARTA))
            self.immagini_carte = {}
            for seme in ['C', 'D', 'H', 'S']:
                for rango in ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']:
                    nome_file = f"{rango}{seme}.png"
                    self.immagini_carte[nome_file] = ImageTk.PhotoImage(Image.open(f"{self.PERCORSO_CARTE}/{nome_file}"))
            return True
        except:
            messagebox.showerror("Errore", "Impossibile caricare le immagini delle carte")
            self.root.destroy()
            return False

    def setup_ui(self):
        """Crea l'interfaccia utente."""
        # Area banco
        self.frame_banco = tk.Frame(self.frame_principale, bg=self.COLORE_SFONDO)
        self.frame_banco.pack(pady=20)
        self.etichetta_banco = tk.Label(self.frame_banco, text="Banco: 0", bg=self.COLORE_SFONDO, fg="white", font=("Arial", 14))
        self.etichetta_banco.pack()
        self.carte_banco = tk.Frame(self.frame_banco, bg=self.COLORE_SFONDO)
        self.carte_banco.pack()

        # Area giocatore
        self.frame_giocatore = tk.Frame(self.frame_principale, bg=self.COLORE_SFONDO)
        self.frame_giocatore.pack(pady=20)
        self.etichetta_giocatore = tk.Label(self.frame_giocatore, text="Giocatore: 0", bg=self.COLORE_SFONDO, fg="white", font=("Arial", 14))
        self.etichetta_giocatore.pack()
        self.carte_giocatore = tk.Frame(self.frame_giocatore, bg=self.COLORE_SFONDO)
        self.carte_giocatore.pack()

        # Pulsanti e messaggi
        self.frame_pulsanti = tk.Frame(self.frame_principale, bg=self.COLORE_SFONDO)
        self.frame_pulsanti.pack(pady=20)
        
        for text, command, side in [
            ("Carta", self.giocatore_chiede_carta, "left"),
            ("Stai", self.giocatore_sta, "left"),
            ("Nuova Partita", self.inizia_nuova_partita, "left")
        ]:
            btn = tk.Button(self.frame_pulsanti, text=text, command=command)
            btn.pack(side=side, padx=20)
            if text in ["Carta", "Stai"]:
                setattr(self, f"pulsante_{text.lower()}", btn)
                btn.config(state="disabled")

        self.etichetta_messaggio = tk.Label(self.frame_principale, text="", bg=self.COLORE_SFONDO, fg="yellow", font=("Arial", 16))
        self.etichetta_messaggio.pack()

    def inizia_nuova_partita(self):
        """Inizia una nuova partita."""
        self.mazzo = Mazzo()
        self.mano_giocatore = []
        self.mano_banco = []
        self.partita_finita = False

        # Distribuisci le prime carte
        for _ in range(2):
            self.mano_giocatore.append(self.mazzo.dai_carta())
            self.mano_banco.append(self.mazzo.dai_carta())

        self.aggiorna_display()
        for btn in [self.pulsante_carta, self.pulsante_stai]:
            btn.config(state="normal")
        self.etichetta_messaggio.config(text="")

    def calcola_valore_mano(self, mano):
        """Calcola il valore di una mano di carte."""
        totale = sum(carta.valore for carta in mano)
        assi = sum(1 for carta in mano if carta.rango == 'A')
        
        while totale > 21 and assi:
            totale -= 10
            assi -= 1
        return totale

    def aggiorna_display(self):
        """Aggiorna la visualizzazione delle carte e dei punteggi."""
        for frame in [self.carte_banco, self.carte_giocatore]:
            for widget in frame.winfo_children():
                widget.destroy()

        # Mostra carte banco
        if self.partita_finita:
            for carta in self.mano_banco:
                self.mostra_carta(self.carte_banco, carta)
        else:
            tk.Label(self.carte_banco, image=self.retro_carta, bg=self.COLORE_SFONDO).pack(side="left", padx=5)
            for carta in self.mano_banco[1:]:
                self.mostra_carta(self.carte_banco, carta)

        # Mostra carte giocatore
        for carta in self.mano_giocatore:
            self.mostra_carta(self.carte_giocatore, carta)

        # Aggiorna punteggi
        valore_giocatore = self.calcola_valore_mano(self.mano_giocatore)
        valore_banco = self.calcola_valore_mano(self.mano_banco if self.partita_finita else self.mano_banco[1:])
        self.etichetta_banco.config(text=f"Banco: {valore_banco}")
        self.etichetta_giocatore.config(text=f"Giocatore: {valore_giocatore}")

    def mostra_carta(self, frame, carta):
        """Mostra una singola carta."""
        tk.Label(frame, image=self.immagini_carte[carta.nome_file], bg=self.COLORE_SFONDO).pack(side="left", padx=5)

    def giocatore_chiede_carta(self):
        """Gestisce la richiesta di una carta da parte del giocatore."""
        if not self.partita_finita:
            self.mano_giocatore.append(self.mazzo.dai_carta())
            self.aggiorna_display()
            if self.calcola_valore_mano(self.mano_giocatore) > 21:
                self.termina_gioco("Hai sballato! Vince il banco")

    def giocatore_sta(self):
        """Gestisce quando il giocatore decide di stare."""
        if not self.partita_finita:
            self.partita_finita = True
            self.turno_banco()

    def turno_banco(self):
        """Gestisce il turno del banco."""
        self.partita_finita = True
        valore_giocatore = self.calcola_valore_mano(self.mano_giocatore)
        
        if valore_giocatore > 21:
            self.termina_gioco("Hai sballato! Vince il banco")
            return
            
        self.aggiorna_display()
        
        while self.calcola_valore_mano(self.mano_banco) < self.PUNTEGGIO_MINIMO_BANCO:
            if not (nuova_carta := self.mazzo.dai_carta()):
                break
            self.mano_banco.append(nuova_carta)
            self.aggiorna_display()
            self.root.update()
            self.root.after(1000)
        
        valore_banco = self.calcola_valore_mano(self.mano_banco)
        
        # Determina il vincitore
        if valore_banco > 21:
            msg = f"Banco sballa con {valore_banco}! Hai vinto!"
        elif valore_giocatore > valore_banco:
            msg = f"Hai vinto! {valore_giocatore} batte {valore_banco}"
        elif valore_banco > valore_giocatore:
            msg = f"Vince il banco! {valore_banco} batte {valore_giocatore}"
        else:
            msg = f"Pareggio! Entrambi {valore_banco}"
        self.termina_gioco(msg)

    def termina_gioco(self, messaggio):
        """Termina il gioco."""
        self.partita_finita = True
        self.pulsante_carta.config(state="disabled")
        self.pulsante_stai.config(state="disabled")
        self.etichetta_messaggio.config(text=messaggio)

if __name__ == "__main__":
    root = tk.Tk()
    gioco = GiocoBlackjack(root)
    root.mainloop()