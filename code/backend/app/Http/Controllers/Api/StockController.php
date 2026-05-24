<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\BonCommande;
use App\Models\BonCommandeItem;
use App\Models\Fournisseur;
use App\Models\MouvementStock;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StockController extends Controller
{
    public function articles(Request $request): JsonResponse
    {
        $query = Article::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('designation', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }

        if ($request->boolean('rupture')) {
            $query->whereRaw('stock_actuel <= stock_min');
        }

        $articles = $query->orderBy('designation')->paginate(30);

        return response()->json([
            'data' => $articles->items(),
            'meta' => ['total' => $articles->total(), 'current_page' => $articles->currentPage(), 'last_page' => $articles->lastPage()],
            'stats' => [
                'total_articles' => Article::count(),
                'en_rupture' => Article::whereRaw('stock_actuel <= stock_min')->count(),
                'valeur_stock' => Article::selectRaw('SUM(stock_actuel * prix_unitaire) as val')->value('val') ?? 0,
            ],
        ]);
    }

    public function storeArticle(Request $request): JsonResponse
    {
        $data = $request->validate([
            'designation' => 'required|string|max:200',
            'unite' => 'required|string|max:20',
            'categorie' => 'nullable|string|max:80',
            'prix_unitaire' => 'required|numeric|min:0',
            'stock_min' => 'nullable|numeric|min:0',
            'emplacement' => 'nullable|string|max:80',
        ]);

        $data['code'] = 'ART-' . str_pad(Article::withTrashed()->count() + 1, 4, '0', STR_PAD_LEFT);
        $article = Article::create($data);

        return response()->json($article, 201);
    }

    public function fournisseurs(Request $request): JsonResponse
    {
        $fournisseurs = Fournisseur::where('statut', 'actif')->orderBy('raison_sociale')->get();
        return response()->json(['data' => $fournisseurs]);
    }

    public function storeFournisseur(Request $request): JsonResponse
    {
        $data = $request->validate([
            'raison_sociale' => 'required|string|max:150',
            'ice' => 'nullable|string|max:30',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'ville' => 'nullable|string|max:80',
            'categorie' => 'nullable|string|max:80',
        ]);

        $data['code'] = 'FRN-' . str_pad(Fournisseur::withTrashed()->count() + 1, 3, '0', STR_PAD_LEFT);
        $fournisseur = Fournisseur::create($data);

        return response()->json($fournisseur, 201);
    }

    public function bonsCommande(Request $request): JsonResponse
    {
        $query = BonCommande::with(['fournisseur', 'project', 'createdBy']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $bons = $query->orderBy('date_commande', 'desc')->paginate(20);

        return response()->json([
            'data' => $bons->items(),
            'meta' => ['total' => $bons->total(), 'current_page' => $bons->currentPage(), 'last_page' => $bons->lastPage()],
        ]);
    }

    public function storeBonCommande(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'project_id' => 'nullable|exists:projects,id',
            'date_commande' => 'required|date',
            'date_livraison_prevue' => 'nullable|date|after_or_equal:date_commande',
            'tva' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.article_id' => 'required|exists:articles,id',
            'items.*.quantite' => 'required|numeric|min:0.001',
            'items.*.prix_unitaire' => 'required|numeric|min:0',
        ]);

        $tva = $data['tva'] ?? 20;
        $totalHt = collect($data['items'])->sum(fn($item) => $item['quantite'] * $item['prix_unitaire']);

        $bon = BonCommande::create([
            'numero' => 'BC-' . now()->format('Y') . '-' . str_pad(BonCommande::whereYear('created_at', now()->year)->count() + 1, 4, '0', STR_PAD_LEFT),
            'fournisseur_id' => $data['fournisseur_id'],
            'project_id' => $data['project_id'] ?? null,
            'created_by' => $request->user()->id,
            'date_commande' => $data['date_commande'],
            'date_livraison_prevue' => $data['date_livraison_prevue'] ?? null,
            'tva' => $tva,
            'montant_ht' => $totalHt,
            'montant_ttc' => $totalHt * (1 + $tva / 100),
            'notes' => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            BonCommandeItem::create([
                'bon_commande_id' => $bon->id,
                'article_id' => $item['article_id'],
                'quantite' => $item['quantite'],
                'prix_unitaire' => $item['prix_unitaire'],
                'montant_ht' => $item['quantite'] * $item['prix_unitaire'],
            ]);
        }

        return response()->json($bon->load('fournisseur', 'items.article'), 201);
    }

    public function receptionnerBon(Request $request, BonCommande $bonCommande): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:bon_commande_items,id',
            'items.*.quantite_recue' => 'required|numeric|min:0',
        ]);

        foreach ($request->items as $reception) {
            $item = BonCommandeItem::findOrFail($reception['item_id']);
            $item->increment('quantite_recue', $reception['quantite_recue']);

            Article::find($item->article_id)?->increment('stock_actuel', $reception['quantite_recue']);

            MouvementStock::create([
                'article_id' => $item->article_id,
                'project_id' => $bonCommande->project_id,
                'bon_commande_id' => $bonCommande->id,
                'type' => 'entree',
                'quantite' => $reception['quantite_recue'],
                'prix_unitaire' => $item->prix_unitaire,
                'date_mouvement' => today(),
                'motif' => "Réception BC {$bonCommande->numero}",
            ]);
        }

        $allReceived = $bonCommande->items->every(fn($i) => $i->fresh()->quantite_recue >= $i->quantite);
        if ($allReceived) {
            $bonCommande->update(['statut' => 'livre', 'date_livraison_reelle' => today()]);
        } else {
            $bonCommande->update(['statut' => 'en_cours']);
        }

        return response()->json(['message' => 'Réception enregistrée.', 'bon_commande' => $bonCommande->fresh()->load('items.article')]);
    }
}
