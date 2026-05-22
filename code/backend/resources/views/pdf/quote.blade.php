<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Devis {{ $quote->quote_number }}</title>
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
            width: 40%;
            margin-left: 60%;
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
        .terms {
            margin-top: 20px;
            font-size: 11px;
            color: #64748b;
        }
        .terms-title {
            font-weight: bold;
            color: #475569;
            margin-bottom: 5px;
        }
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 40px;
            margin-bottom: 50px;
        }
        .signatures-table td {
            width: 50%;
            vertical-align: top;
            height: 120px;
        }
        .signature-box {
            border: 1px dashed #cbd5e1;
            border-radius: 6px;
            padding: 15px;
            height: 100px;
            font-size: 11px;
            color: #64748b;
        }
        .signature-title {
            font-weight: bold;
            color: #334155;
            margin-bottom: 40px;
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
                <div class="doc-title">DEVIS</div>
                <div><strong>N° Devis :</strong> {{ $quote->quote_number }}</div>
                <div><strong>Date :</strong> {{ \Carbon\Carbon::parse($quote->created_at)->format('d/m/Y') }}</div>
                <div><strong>Validité :</strong> {{ $quote->valid_until ? \Carbon\Carbon::parse($quote->valid_until)->format('d/m/Y') : '30 jours' }}</div>
                <div><strong>Statut :</strong> {{ $quote->status }}</div>
            </td>
        </tr>
    </table>

    <table class="details-table">
        <tr>
            <td class="details-col">
                <div class="card">
                    <div class="card-title">Émetteur</div>
                    <strong>ATLAS WORKS</strong><br>
                    Service Commercial<br>
                    @if($quote->creator)
                        Commercial: {{ $quote->creator->name }}<br>
                        Email: {{ $quote->creator->email }}
                    @endif
                </div>
            </td>
            <td class="details-col">
                <div class="card-client">
                    <div class="card-title">Client</div>
                    <strong>{{ $quote->account->name }}</strong><br>
                    @if($quote->account->address)
                        {{ $quote->account->address }}<br>
                    @endif
                    @if($quote->account->city)
                        {{ $quote->account->city }}, Maroc<br>
                    @endif
                    @if($quote->account->email)
                        Email: {{ $quote->account->email }}<br>
                    @endif
                    @if($quote->account->ice)
                        <strong>ICE:</strong> {{ $quote->account->ice }}
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <h3 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px;">Désignation des Prestations</h3>
    
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 10%;" class="text-center">Quantité</th>
                <th style="width: 10%;" class="text-center">Unité</th>
                <th style="width: 15%;" class="text-right">P.U. HT</th>
                <th style="width: 15%;" class="text-right">Montant HT</th>
            </tr>
        </thead>
        <tbody>
            @forelse($quote->items as $item)
                <tr>
                    <td>
                        @if($item->section)
                            <strong>[{{ $item->section }}]</strong><br>
                        @endif
                        {!! nl2br(e($item->description)) !!}
                    </td>
                    <td class="text-center">{{ number_format($item->quantity, 2, ',', ' ') }}</td>
                    <td class="text-center">{{ $item->unit ?? 'U' }}</td>
                    <td class="text-right">{{ number_format($item->unit_price_ht, 2, ',', ' ') }} DH</td>
                    <td class="text-right">{{ number_format($item->total_price_ht, 2, ',', ' ') }} DH</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center">Aucune prestation chiffrée.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <table class="financial-table">
        <tr>
            <td><strong>Total HT</strong></td>
            <td class="text-right">{{ number_format($quote->total_ht, 2, ',', ' ') }} DH</td>
        </tr>
        <tr>
            <td>TVA ({{ number_format($quote->tva_rate ?? 20, 0) }}%)</td>
            <td class="text-right">{{ number_format($quote->total_ht * (($quote->tva_rate ?? 20) / 100), 2, ',', ' ') }} DH</td>
        </tr>
        @if($quote->retention_rate > 0)
            <tr>
                <td>Retenue de Garantie ({{ number_format($quote->retention_rate, 1) }}%)</td>
                <td class="text-right" style="color: #dc2626;">- {{ number_format($quote->total_ttc * ($quote->retention_rate / 100), 2, ',', ' ') }} DH</td>
            </tr>
        @endif
        <tr class="total-row">
            <td><strong>Total TTC</strong></td>
            <td class="text-right"><strong>{{ number_format($quote->total_ttc, 2, ',', ' ') }} DH</strong></td>
        </tr>
    </table>

    <div class="terms">
        <div class="terms-title">Conditions de règlement :</div>
        <ul>
            <li>Acompte de 30% à la commande, solde selon avancement des travaux.</li>
            <li>Les prix mentionnés sont valables uniquement pour les quantités spécifiées.</li>
            <li>En cas d'acceptation, merci de nous retourner ce devis revêtu de votre signature précédée de la mention manuscrite "Bon pour accord" et de votre cachet.</li>
        </ul>
    </div>

    <table class="signatures-table">
        <tr>
            <td style="padding-right: 15px;">
                <div class="signature-box">
                    <div class="signature-title">Pour Atlas Works (Signature et Cachet)</div>
                </div>
            </td>
            <td style="padding-left: 15px;">
                <div class="signature-box">
                    <div class="signature-title">Pour le Client (Date, Signature et Cachet précédés de "Bon pour accord")</div>
                </div>
            </td>
        </tr>
    </table>

    <div class="footer">
        ATLAS WORKS S.A.R.L. AU - RC Casablanca 54321 - IF 98765432 - Patente 12345678 - ICE 001234567890123<br>
        Siège Social: Boulevard Abdelmoumen, Casablanca, Maroc - Capital: 100 000 DH
    </div>

</body>
</html>
