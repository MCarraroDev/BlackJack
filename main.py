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
    
    # Costanti del gioco
    PERCORSO_RETRO_CARTA = "assets/r88_Casino/img/cards/cardBack.png"
    PERCORSO_CARTE = "assets/r88_Casino/img/cards"
    PUNTEGGIO_MINIMO_BANCO = 17  # Il banco deve pescare fino a raggiungere almeno 17

    def __init__(self, root):
        """
        Inizializza il gioco del Blackjack.
        
        Args:
            root: la finestra principale di Tkinter
        """
        self.root = root
        self.configura_finestra()
        self.carica_immagini_carte()
        self.crea_widgets()
        self.inizia_nuova_partita()

    # ---------- Configurazione Iniziale ----------

    def configura_finestra(self):
        """Imposta le proprietà della finestra principale"""
        self.root.title("Blackjack")
        self.root.geometry("1280x720")  # Dimensione ottimale per un tavolo da gioco
        self.root.resizable(False, False)  # Impedisce il ridimensionamento
        self.colore_sfondo_tavolo = "#233b30"  # Verde scuro del tavolo
        
        # Crea lo sfondo verde del tavolo
        self.sfondo = tk.Label(self.root, bg=self.colore_sfondo_tavolo)
        self.sfondo.place(x=0, y=0, relwidth=1, relheight=1)

    def carica_immagini_carte(self):
        """
        Carica le immagini di tutte le carte dal disco.
        Se non riesce a caricare le immagini, mostra un errore e chiude il gioco.
        """
        try:
            # Carica l'immagine del retro della carta
            img_retro = Image.open(self.PERCORSO_RETRO_CARTA)
            self.retro_carta = ImageTk.PhotoImage(img_retro)
            
            # Carica le immagini di tutte le carte
            self.immagini_carte = {}
            semi = ['C', 'D', 'H', 'S']
            ranghi = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']
            
            for seme in semi:
                for rango in ranghi:
                    nome_file = f"{rango}{seme}.png"
                    img = Image.open(f"{self.PERCORSO_CARTE}/{nome_file}")
                    self.immagini_carte[nome_file] = ImageTk.PhotoImage(img)
        except:
            messagebox.showerror("Errore", "Impossibile caricare le immagini delle carte")
            self.root.destroy()

    # ---------- Creazione Interface Grafica ----------

    def crea_widgets(self):
        """Crea tutti gli elementi grafici del gioco"""
        # Frame principale che contiene tutto
        self.frame_principale = tk.Frame(self.root, bg=self.colore_sfondo_tavolo)
        self.frame_principale.pack(fill="both", expand=True)

        self.crea_area_banco()     # Area per le carte del banco
        self.crea_area_giocatore() # Area per le carte del giocatore
        self.crea_pulsanti()       # Pulsanti di gioco
        
        # Etichetta per i messaggi (vittoria, sconfitta, ecc.)
        self.etichetta_messaggio = tk.Label(self.frame_principale, text="", 
                                    bg=self.colore_sfondo_tavolo, 
                                    fg="yellow", font=("Arial", 16))
        self.etichetta_messaggio.pack()

    def crea_area_banco(self):
        """Crea l'area dove vengono mostrate le carte del banco"""
        self.frame_banco = tk.Frame(self.frame_principale, bg=self.colore_sfondo_tavolo)
        self.frame_banco.pack(pady=20)
        self.etichetta_banco = tk.Label(self.frame_banco, text="Banco: 0",
                                   bg=self.colore_sfondo_tavolo, 
                                   fg="white", font=("Arial", 14))
        self.etichetta_banco.pack()
        self.carte_banco = tk.Frame(self.frame_banco, bg=self.colore_sfondo_tavolo)
        self.carte_banco.pack()

    def crea_area_giocatore(self):
        """Crea l'area dove vengono mostrate le carte del giocatore"""
        self.frame_giocatore = tk.Frame(self.frame_principale, bg=self.colore_sfondo_tavolo)
        self.frame_giocatore.pack(pady=20)
        self.etichetta_giocatore = tk.Label(self.frame_giocatore, text="Giocatore: 0",
                                   bg=self.colore_sfondo_tavolo, 
                                   fg="white", font=("Arial", 14))
        self.etichetta_giocatore.pack()
        self.carte_giocatore = tk.Frame(self.frame_giocatore, bg=self.colore_sfondo_tavolo)
        self.carte_giocatore.pack()

    def crea_pulsanti(self):
        """Crea i pulsanti per le azioni del giocatore"""
        self.frame_pulsanti = tk.Frame(self.frame_principale, bg=self.colore_sfondo_tavolo)
        self.frame_pulsanti.pack(pady=20)
        
        # Pulsante per chiedere una carta
        self.pulsante_carta = tk.Button(self.frame_pulsanti, text="Carta", 
                               command=self.giocatore_chiede_carta, state="disabled")
        self.pulsante_carta.pack(side="left", padx=20)
        
        # Pulsante per fermarsi
        self.pulsante_stai = tk.Button(self.frame_pulsanti, text="Stai", 
                                 command=self.giocatore_sta, state="disabled")
        self.pulsante_stai.pack(side="left", padx=20)
        
        # Pulsante per iniziare una nuova partita
        self.pulsante_nuova_partita = tk.Button(self.frame_pulsanti, text="Nuova Partita", 
                                   command=self.inizia_nuova_partita)
        self.pulsante_nuova_partita.pack(side="left", padx=20)

    # ---------- Logica di Gioco ----------

    def inizia_nuova_partita(self):
        """
        Inizia una nuova partita:
        - Crea un nuovo mazzo
        - Distribuisce le prime due carte a giocatore e banco
        - Abilita i pulsanti di gioco
        """
        self.mazzo = Mazzo()  # Crea un nuovo mazzo da 6 mazzi standard
        self.mano_giocatore = []
        self.mano_banco = []
        self.partita_finita = False

        # Distribuisci le prime due carte a giocatore e banco
        self.mano_giocatore.append(self.mazzo.dai_carta())
        self.mano_banco.append(self.mazzo.dai_carta())
        self.mano_giocatore.append(self.mazzo.dai_carta())
        self.mano_banco.append(self.mazzo.dai_carta())

        self.aggiorna_display()
        self.pulsante_carta.config(state="normal")  # Abilita i pulsanti
        self.pulsante_stai.config(state="normal")
        self.etichetta_messaggio.config(text="")

    def calcola_valore_mano(self, mano):
        """
        Calcola il valore di una mano di carte.
        Gli assi valgono 11, ma se il totale supera 21, 
        vengono contati come 1 uno alla volta.
        
        Args:
            mano: lista di carte da valutare
            
        Returns:
            int: il valore totale della mano
        """
        totale = sum(carta.valore for carta in mano)
        assi = sum(1 for carta in mano if carta.rango == 'A')

        # Se il totale supera 21 e ci sono assi, conta gli assi come 1
        while totale > 21 and assi > 0:
            totale -= 10  # Converti un asso da 11 a 1
            assi -= 1

        return totale

    # ---------- Gestione Display ----------

    def aggiorna_display(self):
        """Aggiorna la visualizzazione delle carte e dei punteggi"""
        self.pulisci_carte_mostrate()
        self.mostra_carte_banco()
        self.mostra_carte_giocatore()
        self.aggiorna_punteggi()

    def pulisci_carte_mostrate(self):
        """Rimuove tutte le carte mostrate per poi ridisegnarle"""
        for widget in self.carte_banco.winfo_children():
            widget.destroy()
        for widget in self.carte_giocatore.winfo_children():
            widget.destroy()

    def mostra_carte_banco(self):
        """
        Mostra le carte del banco.
        Durante il gioco, la prima carta è coperta.
        A fine partita, mostra tutte le carte.
        """
        if self.partita_finita:
            for carta in self.mano_banco:
                self.mostra_carta(self.carte_banco, carta)
        else:
            # Durante il gioco, mostra la prima carta coperta
            tk.Label(self.carte_banco, image=self.retro_carta, 
                    bg=self.colore_sfondo_tavolo).pack(side="left", padx=5)
            for carta in self.mano_banco[1:]:
                self.mostra_carta(self.carte_banco, carta)

    def mostra_carte_giocatore(self):
        """Mostra tutte le carte del giocatore"""
        for carta in self.mano_giocatore:
            self.mostra_carta(self.carte_giocatore, carta)

    def mostra_carta(self, frame, carta):
        """
        Mostra una singola carta nel frame specificato
        
        Args:
            frame: il frame dove mostrare la carta
            carta: la carta da mostrare
        """
        tk.Label(frame, image=self.immagini_carte[carta.nome_file], 
                bg=self.colore_sfondo_tavolo).pack(side="left", padx=5)

    def aggiorna_punteggi(self):
        """Aggiorna i punteggi mostrati di banco e giocatore"""
        valore_giocatore = self.calcola_valore_mano(self.mano_giocatore)
        # Durante il gioco, non mostra il valore della prima carta del banco
        valore_banco = self.calcola_valore_mano(self.mano_banco if self.partita_finita 
                                               else self.mano_banco[1:])
        
        self.etichetta_banco.config(text=f"Banco: {valore_banco}")
        self.etichetta_giocatore.config(text=f"Giocatore: {valore_giocatore}")

    # ---------- Azioni di Gioco ----------

    def giocatore_chiede_carta(self):
        """
        Il giocatore chiede una carta.
        Se supera 21, perde automaticamente.
        """
        if not self.partita_finita:
            self.mano_giocatore.append(self.mazzo.dai_carta())
            self.aggiorna_display()
            
            if self.calcola_valore_mano(self.mano_giocatore) > 21:
                self.termina_gioco("Hai sballato! Vince il banco")

    def giocatore_sta(self):
        """
        Il giocatore decide di stare (non vuole altre carte).
        Passa il turno al banco.
        """
        if not self.partita_finita:
            self.partita_finita = True
            self.turno_banco()

    def turno_banco(self):
        """
        Gestisce il turno del banco:
        - Il banco deve pescare finché non raggiunge almeno 17
        - Mostra le carte con un secondo di pausa tra una e l'altra
        """
        self.partita_finita = True
        valore_giocatore = self.calcola_valore_mano(self.mano_giocatore)
        
        if valore_giocatore > 21:
            self.termina_gioco("Hai sballato! Vince il banco")
            return
            
        self.aggiorna_display()
        
        # Il banco deve pescare finché non raggiunge almeno 17
        while self.calcola_valore_mano(self.mano_banco) < self.PUNTEGGIO_MINIMO_BANCO:
            nuova_carta = self.mazzo.dai_carta()
            if not nuova_carta:
                break
                
            self.mano_banco.append(nuova_carta)
            self.aggiorna_display()
            self.root.update()
            self.root.after(1000)  # Pausa di 1 secondo tra le carte
        
        valore_banco = self.calcola_valore_mano(self.mano_banco)
        self.determina_vincitore(valore_banco, valore_giocatore)

    def determina_vincitore(self, valore_banco, valore_giocatore):
        """
        Determina chi ha vinto confrontando i punteggi.
        
        Args:
            valore_banco: il punteggio totale del banco
            valore_giocatore: il punteggio totale del giocatore
        """
        if valore_banco > 21:
            self.termina_gioco(f"Banco sballa con {valore_banco}! Hai vinto!")
        elif valore_giocatore > valore_banco:
            self.termina_gioco(f"Hai vinto! {valore_giocatore} batte {valore_banco}")
        elif valore_banco > valore_giocatore:
            self.termina_gioco(f"Vince il banco! {valore_banco} batte {valore_giocatore}")
        else:
            self.termina_gioco(f"Pareggio! Entrambi {valore_banco}")

    def termina_gioco(self, messaggio):
        """
        Termina il gioco:
        - Disabilita i pulsanti
        - Mostra il messaggio finale
        
        Args:
            messaggio: il messaggio da mostrare
        """
        self.partita_finita = True
        self.pulsante_carta.config(state="disabled")
        self.pulsante_stai.config(state="disabled")
        self.etichetta_messaggio.config(text=messaggio)

# Avvio del gioco
if __name__ == "__main__":
    root = tk.Tk()
    gioco = GiocoBlackjack(root)
    root.mainloop()