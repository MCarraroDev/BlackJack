import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
from deck import Mazzo

class GiocoBlackjack:
    PERCORSO_RETRO_CARTA = "assets/r88_Casino/img/cards/cardBack.png"
    PERCORSO_CARTE = "assets/r88_Casino/img/cards"
    PUNTEGGIO_MINIMO_BANCO = 17

    def __init__(self, radice):
        self.radice = radice
        self.configura_finestra()
        self.carica_immagini_carte()
        self.crea_widgets()
        self.inizia_nuova_partita()

    def configura_finestra(self):
        self.radice.title("Blackjack")
        self.radice.geometry("1280x720")
        self.radice.resizable(False, False)
        self.colore_sfondo_tavolo = "#233b30"
        
        self.sfondo = tk.Label(self.radice, bg=self.colore_sfondo_tavolo)
        self.sfondo.place(x=0, y=0, relwidth=1, relheight=1)

    def carica_immagini_carte(self):
        """Carica le immagini delle carte"""
        try:
            # Carica il retro della carta
            img_retro = Image.open(self.PERCORSO_RETRO_CARTA)
            self.retro_carta = ImageTk.PhotoImage(img_retro)
            
            # Carica tutte le carte
            self.immagini_carte = {}
            semi = ['C', 'D', 'H', 'S']
            ranghi = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']
            
            for seme in semi:
                for rango in ranghi:
                    nome_file = f"{rango}{seme}.png"
                    try:
                        img = Image.open(f"{self.PERCORSO_CARTE}/{nome_file}")
                        self.immagini_carte[nome_file] = ImageTk.PhotoImage(img)
                    except:
                        messagebox.showerror("Errore", f"Immagine {nome_file} non trovata")
                        self.radice.destroy()
                        return
        except:
            messagebox.showerror("Errore", "Impossibile caricare le immagini delle carte")
            self.radice.destroy()
            return

    def crea_widgets(self):
        # Frame principale
        self.frame_principale = tk.Frame(self.radice, bg=self.colore_sfondo_tavolo)
        self.frame_principale.pack(fill="both", expand=True)

        # Area banco
        self.crea_area_banco()
        
        # Area giocatore
        self.crea_area_giocatore()
        
        # Pulsanti
        self.crea_pulsanti()

        # Messaggi
        self.etichetta_messaggio = tk.Label(self.frame_principale, text="", 
                                    bg=self.colore_sfondo_tavolo, 
                                    fg="yellow", font=("Arial", 16))
        self.etichetta_messaggio.pack()

    def crea_area_banco(self):
        self.frame_banco = tk.Frame(self.frame_principale, bg=self.colore_sfondo_tavolo)
        self.frame_banco.pack(pady=20)
        self.etichetta_banco = tk.Label(self.frame_banco, text="Banco: 0",
                                   bg=self.colore_sfondo_tavolo, 
                                   fg="white", font=("Arial", 14))
        self.etichetta_banco.pack()
        self.carte_banco = tk.Frame(self.frame_banco, bg=self.colore_sfondo_tavolo)
        self.carte_banco.pack()

    def crea_area_giocatore(self):
        self.frame_giocatore = tk.Frame(self.frame_principale, bg=self.colore_sfondo_tavolo)
        self.frame_giocatore.pack(pady=20)
        self.etichetta_giocatore = tk.Label(self.frame_giocatore, text="Giocatore: 0",
                                   bg=self.colore_sfondo_tavolo, 
                                   fg="white", font=("Arial", 14))
        self.etichetta_giocatore.pack()
        self.carte_giocatore = tk.Frame(self.frame_giocatore, bg=self.colore_sfondo_tavolo)
        self.carte_giocatore.pack()

    def crea_pulsanti(self):
        self.frame_pulsanti = tk.Frame(self.frame_principale, bg=self.colore_sfondo_tavolo)
        self.frame_pulsanti.pack(pady=20)
        
        self.pulsante_carta = tk.Button(self.frame_pulsanti, text="Carta", 
                               command=self.giocatore_chiede_carta, state="disabled")
        self.pulsante_carta.pack(side="left", padx=20)
        
        self.pulsante_stai = tk.Button(self.frame_pulsanti, text="Stai", 
                                 command=self.giocatore_sta, state="disabled")
        self.pulsante_stai.pack(side="left", padx=20)
        
        self.pulsante_nuova_partita = tk.Button(self.frame_pulsanti, text="Nuova Partita", 
                                   command=self.inizia_nuova_partita)
        self.pulsante_nuova_partita.pack(side="left", padx=20)

    def inizia_nuova_partita(self):
        self.mazzo = Mazzo()
        self.mano_giocatore = []
        self.mano_banco = []
        self.partita_finita = False

        # Distribuisci carte iniziali
        self.mano_giocatore.append(self.mazzo.dai_carta())
        self.mano_banco.append(self.mazzo.dai_carta())
        self.mano_giocatore.append(self.mazzo.dai_carta())
        self.mano_banco.append(self.mazzo.dai_carta())

        self.aggiorna_display()
        self.pulsante_carta.config(state="normal")
        self.pulsante_stai.config(state="normal")
        self.etichetta_messaggio.config(text="")

    def calcola_valore_mano(self, mano):
        totale = sum(carta.valore for carta in mano)
        assi = sum(1 for carta in mano if carta.rango == 'A')

        while totale > 21 and assi > 0:
            totale -= 10
            assi -= 1

        return totale

    def aggiorna_display(self):
        self.pulisci_carte_mostrate()
        self.mostra_carte_banco()
        self.mostra_carte_giocatore()
        self.aggiorna_punteggi()

    def pulisci_carte_mostrate(self):
        for widget in self.carte_banco.winfo_children():
            widget.destroy()
        for widget in self.carte_giocatore.winfo_children():
            widget.destroy()

    def mostra_carte_banco(self):
        if self.partita_finita:
            for carta in self.mano_banco:
                self.mostra_carta(self.carte_banco, carta)
        else:
            tk.Label(self.carte_banco, image=self.retro_carta, 
                    bg=self.colore_sfondo_tavolo).pack(side="left", padx=5)
            for carta in self.mano_banco[1:]:
                self.mostra_carta(self.carte_banco, carta)

    def mostra_carte_giocatore(self):
        for carta in self.mano_giocatore:
            self.mostra_carta(self.carte_giocatore, carta)

    def mostra_carta(self, frame, carta):
        tk.Label(frame, image=self.immagini_carte[carta.nome_file], 
                bg=self.colore_sfondo_tavolo).pack(side="left", padx=5)

    def aggiorna_punteggi(self):
        valore_giocatore = self.calcola_valore_mano(self.mano_giocatore)
        valore_banco = self.calcola_valore_mano(self.mano_banco if self.partita_finita 
                                               else self.mano_banco[1:])
        
        self.etichetta_banco.config(text=f"Banco: {valore_banco}")
        self.etichetta_giocatore.config(text=f"Giocatore: {valore_giocatore}")

    def giocatore_chiede_carta(self):
        if not self.partita_finita:
            self.mano_giocatore.append(self.mazzo.dai_carta())
            self.aggiorna_display()
            
            if self.calcola_valore_mano(self.mano_giocatore) > 21:
                self.termina_gioco("Hai sballato! Vince il banco")

    def giocatore_sta(self):
        if not self.partita_finita:
            self.partita_finita = True
            self.turno_banco()

    def turno_banco(self):
        self.partita_finita = True
        valore_banco = self.calcola_valore_mano(self.mano_banco)
        valore_giocatore = self.calcola_valore_mano(self.mano_giocatore)
        
        if valore_giocatore > 21:
            self.termina_gioco("Hai sballato! Vince il banco")
            return
            
        self.aggiorna_display()
        
        while self.calcola_valore_mano(self.mano_banco) < self.PUNTEGGIO_MINIMO_BANCO:
            nuova_carta = self.mazzo.dai_carta()
            if not nuova_carta:
                break
                
            self.mano_banco.append(nuova_carta)
            self.aggiorna_display()
            self.radice.update()
            self.radice.after(1000)
        
        valore_banco = self.calcola_valore_mano(self.mano_banco)
        self.determina_vincitore(valore_banco, valore_giocatore)

    def determina_vincitore(self, valore_banco, valore_giocatore):
        if valore_banco > 21:
            self.termina_gioco("Banco sballa! Hai vinto!")
        elif valore_giocatore > valore_banco:
            self.termina_gioco("Hai vinto!")
        elif valore_banco > valore_giocatore:
            self.termina_gioco("Vince il banco!")
        else:
            self.termina_gioco("Pareggio!")

    def termina_gioco(self, messaggio):
        self.partita_finita = True
        self.pulsante_carta.config(state="disabled")
        self.pulsante_stai.config(state="disabled")
        self.etichetta_messaggio.config(text=messaggio)

if __name__ == "__main__":
    radice = tk.Tk()
    gioco = GiocoBlackjack(radice)
    radice.mainloop()