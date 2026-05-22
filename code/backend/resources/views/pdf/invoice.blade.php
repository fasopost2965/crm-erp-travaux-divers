<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #334155;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .header-logo {
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 1px;
        }
        .header-tagline {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
        }
        .header-meta {
            text-align: right;
            font-size: 12px;
        }
        .doc-title {
            font-size: 20px;
            color: #2563eb;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .company-info {
            font-size: 11px;
            color: #64748b;
            margin-top: 5px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .details-col {
            width: 50%;
            vertical-align: top;
        }
        .card {
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 15px;
            margin-right: 10px;
        }
        .card-client {
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 15px;
            margin-left: 10px;
        }
        .card-title {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: bold;
            color: #475569;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
            margin-bottom: 8px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 10px;
            font-size: 12px;
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .items-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .financial-table {
            width: 45%;
            margin-left: 55%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        .financial-table td {
            padding: 8px 10px;
            font-size: 12px;
        }
        .financial-table tr.total-row td {
            font-weight: bold;
            font-size: 14px;
            color: #0f172a;
            border-top: 2px solid #0f172a;
            background-color: #f1f5f9;
        }
        .financial-table tr.highlight-row td {
            font-weight: bold;
            color: #2563eb;
            background-color: #eff6ff;
        }
        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }
        .rib-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            background-color: #f8fafc;
            padding: 12px;
            font-size: 11px;
            color: #475569;
            margin-top: 20px;
        }
        .rib-title {
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 10px;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td>
                <div class="header-logo">ATLAS WORKS</div>
                <div class="header-tagline">Travaux Divers & Aménagement</div>
                <div class="company-info">
                    Atlas Works S.A.R.L. AU<br>
                    Boulevard Abdelmoumen, Résidence Al-Yassine, N° 45<br>
                    Casablanca, Maroc<br>
                    Email: contact@atlasworks.ma | Tél: +212 5 22 45 45 45
                </div>
            </td>
            <td class="header-meta">
                <div class="doc-title">FACTURE</div>
                <div><strong>Type:</strong> {{ $invoice->type }}</div>
                @if($invoice->situation_percentage > 0)
                    <div><strong>Avancement:</strong> {{ number_format($invoice->situation_percentage, 0) }}%</div>
                @endif
                <div><strong>N° Facture :</strong> {{ $invoice->invoice_number }}</div>
                <div><strong>Date d'émission :</strong> {{ \Carbon\Carbon::parse($invoice->created_at)->format('d/m/Y') }}</div>
                <div><strong>Échéance :</strong> {{ $invoice->due_date ? \Carbon\Carbon::parse($invoice->due_date)->format('d/m/Y') : \Carbon\Carbon::parse($invoice->created_at)->addDays(30)->format('d/m/Y') }}</div>
                <div><strong>Statut :</strong> {{ $invoice->status }}</div>
            </td>
        </tr>
    </table>

    <table class="details-table">
        <tr>
            <td class="details-col">
                <div class="card">
                    <div class="card-title">Coordonnées Légales Atlas Works</div>
                    <strong>ICE:</strong> 001234567890123<br>
                    <strong>RC:</strong> 54321 (Casablanca)<br>
                    <strong>IF:</strong> 98765432<br>
                    <strong>Patente:</strong> 12345678
                </div>
            </td>
            <td class="details-col">
                <div class="card-client">
                    <div class="card-title">Facturé à</div>
                    <strong>{{ $invoice->account->name }}</strong><br>
                    @if($invoice->account->address)
                        {{ $invoice->account->address }}<br>
                    @endif
                    @if($invoice->account->city)
                        {{ $invoice->account->city }}, Maroc<br>
                    @endif
                    @if($invoice->account->email)
                        Email: {{ $invoice->account->email }}<br>
                    @endif
                    @if($invoice->account->ice)
                        <strong>ICE:</strong> {{ $invoice->account->ice }}
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <div style="font-size: 12px; margin-bottom: 15px; color: #475569;">
        @if($invoice->quote)
            <strong>Devis de référence :</strong> {{ $invoice->quote->quote_number }} (du {{ \Carbon\Carbon::parse($invoice->quote->created_at)->format('d/m/Y') }})
        @endif
        @if($invoice->title)
            <br><strong>Objet :</strong> {{ $invoice->title }}
        @endif
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 55%;">Désignation des Prestations</th>
                <th style="width: 10%;" class="text-center">Quantité</th>
                <th style="width: 10%;" class="text-center">Unité</th>
                <th style="width: 12%;" class="text-right">P.U. HT</th>
                <th style="width: 13%;" class="text-right">Montant HT</th>
            </tr>
        </thead>
        <tbody>
            @forelse($invoice->items as $item)
                <tr>
                    <td>{!! nl2br(e($item->description)) !!}</td>
                    <td class="text-center">{{ number_format($item->quantity, 2, ',', ' ') }}</td>
                    <td class="text-center">{{ $item->unit ?? 'U' }}</td>
                    <td class="text-right">{{ number_format($item->unit_price_ht, 2, ',', ' ') }} DH</td>
                    <td class="text-right">{{ number_format($item->total_price_ht, 2, ',', ' ') }} DH</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center">Aucune ligne de facturation.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <table class="financial-table">
        <tr>
            <td><strong>Total HT</strong></td>
            <td class="text-right">{{ number_format($invoice->total_ht, 2, ',', ' ') }} DH</td>
        </tr>
        <tr>
            <td>TVA ({{ number_format($invoice->tva_rate ?? 20, 0) }}%)</td>
            <td class="text-right">{{ number_format($invoice->total_ht * (($invoice->tva_rate ?? 20) / 100), 2, ',', ' ') }} DH</td>
        </tr>
        @if($invoice->retention_amount > 0)
            <tr>
                <td>Retenue de Garantie (Déduite)</td>
                <td class="text-right" style="color: #dc2626;">- {{ number_format($invoice->retention_amount, 2, ',', ' ') }} DH</td>
            </tr>
        @endif
        <tr class="total-row">
            <td><strong>Total TTC Net</strong></td>
            <td class="text-right"><strong>{{ number_format($invoice->total_ttc, 2, ',', ' ') }} DH</strong></td>
        </tr>
        <tr>
            <td>Déjà réglé</td>
            <td class="text-right" style="color: #16a34a;">- {{ number_format($invoice->amount_paid, 2, ',', ' ') }} DH</td>
        </tr>
        <tr class="highlight-row">
            <td><strong>Net à Payer (Restant)</strong></td>
            <td class="text-right"><strong>{{ number_format($invoice->amount_remaining, 2, ',', ' ') }} DH</strong></td>
        </tr>
    </table>

    <div class="rib-card">
        <div class="rib-title">Règlement par virement bancaire :</div>
        <strong>Banque :</strong> Attijariwafa Bank - Agence Boulevard Abdelmoumen<br>
        <strong>Bénéficiaire :</strong> ATLAS WORKS S.A.R.L. AU<br>
        <strong>RIB :</strong> 007 780 0000123456789012 45<br>
        <span style="font-size: 10px; color: #64748b;">* Merci de mentionner le numéro de facture <strong>{{ $invoice->invoice_number }}</strong> dans le libellé de votre virement.</span>
    </div>

    <div style="margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 15px;">
        <strong>Conditions de paiement :</strong> Paiement à l'échéance indiquée. En cas de retard de paiement, des pénalités au taux légal en vigueur seront appliquées.
    </div>

    <div class="footer">
        ATLAS WORKS S.A.R.L. AU - RC Casablanca 54321 - IF 98765432 - Patente 12345678 - ICE 001234567890123<br>
        Siège Social: Boulevard Abdelmoumen, Casablanca, Maroc - Capital: 100 000 DH
    </div>

</body>
</html>
