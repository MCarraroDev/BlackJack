import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
import random

class Card:
    def __init__(self, filename):
        self.filename = filename
        self.rank = filename[0].upper()
        self.suit = filename[1].upper()
        self.value = self._calculate_value()
        self.image = None

    def _calculate_value(self):
        rank_values = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 
            '8': 8, '9': 9, 'T': 10, 'J': 10, 'Q': 10, 
            'K': 10, 'A': 11
        }
        return rank_values.get(self.rank, 0)

    def get_rank_name(self):
        return {
            '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
            '8': '8', '9': '9', 'T': '10', 'J': 'Jack', 'Q': 'Queen',
            'K': 'King', 'A': 'Ace'
        }[self.rank]

    def get_suit_name(self):
        return {
            'C': 'Clubs', 'D': 'Diamonds',
            'H': 'Hearts', 'S': 'Spades'
        }[self.suit]

# Costanti di gioco
MIN_DEALER_SCORE = 17
NUM_DECKS = 6
CARD_BACK_PATH = "assets/r88_Casino/img/cards/cardBack.png"
CARDS_PATH = "assets/r88_Casino/img/cards"

class Deck:
    def __init__(self, num_decks=NUM_DECKS):
        self.num_decks = num_decks
        self.cards = []
        self._create_deck()
        self.shuffle()

    def _create_deck(self):
        suits = ['C', 'D', 'H', 'S']
        ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']
        
        for _ in range(self.num_decks):
            for suit in suits:
                for rank in ranks:
                    filename = f"{rank}{suit}.png"
                    self.cards.append(Card(filename))
        self.shuffle()

    def shuffle(self):
        if not self.cards:
            self._create_deck()
        random.shuffle(self.cards)

    def deal_card(self):
        if not self.cards:
            self.shuffle()
        return self.cards.pop() if self.cards else None

    def cards_remaining(self):
        return len(self.cards)

class BlackjackGame:
    def __init__(self, root):
        self.root = root
        self.root.title("Blackjack")
        self.root.geometry("1024x768")  # Nuova dimensione della finestra

        # Disabilita il ridimensionamento della finestra
        self.root.resizable(False, False)
        
        # Sposta la definizione di table_background_color come attributo della classe
        self.table_background_color = "#233b30"

        # Modifica il colore di sfondo del tavolo
        lbl_tavolo = tk.Label(self.root, bg=self.table_background_color)
        lbl_tavolo.place(x=0, y=0, relwidth=1, relheight=1)  # Adatta l'immagine allo sfondo

        # Caricamento immagini
        self.card_images = {}
        self.load_card_images()
        
        # Setup interfaccia
        self.create_widgets()
        self.start_new_game()

    def load_card_images(self):
        try:
            # Carica retro carta
            back_img = Image.open(CARD_BACK_PATH)
            self.card_back = ImageTk.PhotoImage(back_img)
            
            # Carica tutte le carte
            suits = ['C', 'D', 'H', 'S']
            ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a']
            
            for suit in suits:
                for rank in ranks:
                    filename = f"{rank}{suit}.png"
                    img = Image.open(f"{CARDS_PATH}/{filename}")
                    self.card_images[filename] = ImageTk.PhotoImage(img)
                    
        except Exception as e:
            messagebox.showerror("Errore", f"Impossibile caricare le immagini: {str(e)}")
            self.root.destroy()

    def create_widgets(self):
        # Frame principale
        self.main_frame = tk.Frame(self.root, bg=self.table_background_color)
        self.main_frame.pack(fill="both", expand=True)

        # Area banco
        self.dealer_frame = tk.Frame(self.main_frame, bg=self.table_background_color)
        self.dealer_frame.pack(pady=20)
        self.dealer_label = tk.Label(self.dealer_frame, text="Banco: 0", bg=self.table_background_color, fg="white", font=("Arial", 14))
        self.dealer_label.pack()

        # Carte banco
        self.dealer_cards = tk.Frame(self.dealer_frame, bg=self.table_background_color)
        self.dealer_cards.pack()

        # Area giocatore
        self.player_frame = tk.Frame(self.main_frame, bg=self.table_background_color)
        self.player_frame.pack(pady=20)
        self.player_label = tk.Label(self.player_frame, text="Giocatore: 0", bg=self.table_background_color, fg="white", font=("Arial", 14))
        self.player_label.pack()

        # Carte giocatore
        self.player_cards = tk.Frame(self.player_frame, bg=self.table_background_color)
        self.player_cards.pack()

        # Pulsanti
        self.buttons_frame = tk.Frame(self.main_frame, bg=self.table_background_color)
        self.buttons_frame.pack(pady=20)
        
        self.hit_btn = tk.Button(self.buttons_frame, text="Hit", command=self.player_hit, state="disabled")
        self.hit_btn.pack(side="left", padx=20)
        
        self.stand_btn = tk.Button(self.buttons_frame, text="Stand", command=self.player_stand, state="disabled")
        self.stand_btn.pack(side="left", padx=20)
        
        self.restart_btn = tk.Button(self.buttons_frame, text="Nuova Partita", command=self.start_new_game)
        self.restart_btn.pack(side="left", padx=20)


        # Messaggi
        self.message_label = tk.Label(self.main_frame, text="", bg=self.table_background_color, fg="yellow", font=("Arial", 16))
        self.message_label.pack()

    def start_new_game(self):
        self.deck = Deck()
        self.player_hand = []
        self.dealer_hand = []
        self.game_over = False

        # Distribuisci carte iniziali
        self.player_hand.append(self.deck.deal_card())
        self.dealer_hand.append(self.deck.deal_card())
        self.player_hand.append(self.deck.deal_card())
        self.dealer_hand.append(self.deck.deal_card())

        # Aggiorna interfaccia
        self.update_display()
        self.hit_btn.config(state="normal")
        self.stand_btn.config(state="normal")
        self.message_label.config(text="")

    def calculate_hand_value(self, hand):
        total = sum(card.value for card in hand)
        aces = sum(1 for card in hand if card.rank == 'A')

        while total > 21 and aces > 0:
            total -= 10
            aces -= 1

        return total

    def update_display(self):
        # Pulisci le carte visualizzate
        for widget in self.dealer_cards.winfo_children():
            widget.destroy()
        for widget in self.player_cards.winfo_children():
            widget.destroy()

        # Mostra carte banco
        if self.game_over:
            # Mostra tutte le carte del banco quando il gioco è finito
            for card in self.dealer_hand:
                tk.Label(self.dealer_cards, image=self.card_images[card.filename], 
                        bg=self.table_background_color).pack(side="left", padx=5)
        else:
            # Mostra la prima carta coperta e le altre scoperte
            tk.Label(self.dealer_cards, image=self.card_back, 
                    bg=self.table_background_color).pack(side="left", padx=5)
            for card in self.dealer_hand[1:]:
                tk.Label(self.dealer_cards, image=self.card_images[card.filename], 
                        bg=self.table_background_color).pack(side="left", padx=5)

        # Mostra carte giocatore
        for card in self.player_hand:
            tk.Label(self.player_cards, image=self.card_images[card.filename], 
                    bg=self.table_background_color).pack(side="left", padx=5)

        # Calcola e mostra i punteggi
        player_value = self.calculate_hand_value(self.player_hand)
        if self.game_over:
            dealer_value = self.calculate_hand_value(self.dealer_hand)
        else:
            dealer_value = self.calculate_hand_value(self.dealer_hand[1:])

        self.dealer_label.config(text=f"Banco: {dealer_value}")
        self.player_label.config(text=f"Giocatore: {player_value}")

    def player_hit(self):
        if not self.game_over:
            self.player_hand.append(self.deck.deal_card())
            player_value = self.calculate_hand_value(self.player_hand)
            
            self.update_display()
            
            if player_value > 21:
                self.end_game("Hai sballato! Vince il banco")

    def player_stand(self):
        if not self.game_over:
            self.game_over = True
            self.dealer_turn()

    def dealer_turn(self):
        self.game_over = True
        dealer_value = self.calculate_hand_value(self.dealer_hand)
        player_value = self.calculate_hand_value(self.player_hand)
        
        # Se il giocatore ha già sballato, il banco vince automaticamente
        if player_value > 21:
            self.end_game("Hai sballato! Vince il banco")
            return
            
        # Mostra tutte le carte del banco
        self.update_display()
        
        # Il banco deve pescare finché non ha almeno 17 punti
        while self.calculate_hand_value(self.dealer_hand) < MIN_DEALER_SCORE:
            new_card = self.deck.deal_card()
            if not new_card:
                break
                
            self.dealer_hand.append(new_card)
            dealer_value = self.calculate_hand_value(self.dealer_hand)
            self.update_display()
            self.root.update()
            self.root.after(1000)  # Pausa tra le carte
        
        # Ricalcola i valori finali
        dealer_value = self.calculate_hand_value(self.dealer_hand)
        
        # Determina il vincitore
        if dealer_value > 21:
            self.end_game("Banco sballa! Hai vinto!")
        elif player_value > dealer_value:
            self.end_game("Hai vinto!")
        elif dealer_value > player_value:
            self.end_game("Vince il banco!")
        else:
            self.end_game("Pareggio!")
            
        # Disabilita i pulsanti di gioco
        self.hit_btn.config(state="disabled")
        self.stand_btn.config(state="disabled")

    def end_game(self, message=None):
        self.game_over = True
        self.hit_btn.config(state="disabled")
        self.stand_btn.config(state="disabled")

        dealer_value = self.calculate_hand_value(self.dealer_hand)
        player_value = self.calculate_hand_value(self.player_hand)

        if message is None:
            if dealer_value > 21:
                message = "Banco sballa! Hai vinto!"
            elif dealer_value > player_value:
                message = "Vince il banco!"
            elif player_value > dealer_value:
                message = "Hai vinto!"
            else:
                message = "Pareggio!"

        self.message_label.config(text=message)

if __name__ == "__main__":
    root = tk.Tk()
    game = BlackjackGame(root)
    root.mainloop()