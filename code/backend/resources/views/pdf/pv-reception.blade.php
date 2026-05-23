<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>PV de Réception — {{ $project->title }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #334155;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
            background: #ffffff;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
        }
        .header-logo {
            font-size: 22px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 1px;
        }
        .header-tagline {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .company-info {
            font-size: 10px;
            color: #64748b;
            margin-top: 6px;
            line-height: 1.6;
        }
        .doc-title {
            font-size: 18px;
            color: #2563eb;
            font-weight: bold;
            margin-bottom: 4px;
            text-align: right;
        }
        .doc-ref {
            font-size: 11px;
            text-align: right;
            color: #475569;
            line-height: 1.7;
        }
        .doc-ref strong {
            color: #0f172a;
        }
        /* Section titles */
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
            margin-top: 25px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        /* Info cards */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 14px;
        }
        .info-card-title {
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 8px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        .info-label {
            font-size: 10px;
            color: #64748b;
            font-weight: bold;
        }
        .info-value {
            font-size: 11px;
            color: #0f172a;
            font-weight: bold;
        }
        /* Project info inline table */
        .project-info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 15px;
        }
        .project-info-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #f1f5f9;
        }
        .project-info-table td:first-child {
            font-weight: bold;
            color: #64748b;
            width: 35%;
            text-transform: uppercase;
            font-size: 10px;
        }
        .project-info-table td:last-child {
            color: #0f172a;
            font-weight: bold;
        }
        /* Tasks table */
        .tasks-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .tasks-table th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 9px 10px;
            font-size: 11px;
        }
        .tasks-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
        }
        .tasks-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-done {
            background-color: #dcfce7;
            color: #15803d;
        }
        .status-pending {
            background-color: #fef9c3;
            color: #92400e;
        }
        /* Stats box */
        .stats-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .stat-box {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 14px;
            text-align: center;
        }
        .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            line-height: 1;
        }
        .stat-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }
        /* Declaration */
        .declaration-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #2563eb;
            border-radius: 0 6px 6px 0;
            padding: 16px 20px;
            font-size: 11px;
            color: #334155;
            line-height: 1.7;
            margin-bottom: 20px;
        }
        /* Signatures */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            margin-bottom: 40px;
        }
        .sig-col {
            width: 48%;
            vertical-align: top;
        }
        .sig-box {
            border: 1px dashed #cbd5e1;
            border-radius: 6px;
            padding: 14px;
            min-height: 140px;
            background-color: #fafafa;
        }
        .sig-title {
            font-weight: bold;
            color: #1e293b;
            font-size: 11px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 10px;
        }
        .sig-name-label {
            font-size: 9px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }
        .sig-name-value {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 8px;
        }
        .sig-role-value {
            font-size: 10px;
            color: #64748b;
            margin-bottom: 12px;
        }
        .sig-line {
            border-bottom: 1px solid #cbd5e1;
            margin: 12px 0 6px 0;
            height: 1px;
        }
        .sig-image-container {
            text-align: center;
            padding: 5px 0;
        }
        .sig-image-container img {
            max-width: 100%;
            max-height: 80px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        .sig-placeholder {
            color: #cbd5e1;
            font-size: 10px;
            font-style: italic;
            text-align: center;
            padding: 20px 0;
        }
        /* Footer */
        .footer {
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 20px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .spacer { height: 10px; }
        .no-tasks {
            text-align: center;
            color: #94a3b8;
            font-style: italic;
            padding: 16px;
            font-size: 11px;
        }
    </style>
</head>
<body>

    {{-- EN-TÊTE --}}
    <table class="header-table">
        <tr>
            <td style="width: 55%; vertical-align: top;">
                <div class="header-logo">BATIPLUS SARL</div>
                <div class="header-tagline">Travaux de Construction & Rénovation</div>
                <div class="company-info">
                    Zone Industrielle Aïn Sebaâ, Lot N° 12<br>
                    Casablanca 20250, Maroc<br>
                    Tél: +212 5 22 30 30 30 | Fax: +212 5 22 30 30 31<br>
                    Email: contact@batiplus.ma<br>
                    <strong>ICE:</strong> 001987654321098 &nbsp;|&nbsp; <strong>RC:</strong> Casa 123456 &nbsp;|&nbsp; <strong>IF:</strong> 45678901
                </div>
            </td>
            <td style="width: 45%; vertical-align: top;">
                <div class="doc-title">PROCÈS-VERBAL DE RÉCEPTION DES TRAVAUX</div>
                <div class="doc-ref">
                    <strong>Réf. PV :</strong> PV-{{ $project->id }}-{{ date('Ymd') }}<br>
                    <strong>Date d'établissement :</strong> {{ date('d/m/Y') }}<br>
                    <strong>Statut :</strong> Réception définitive<br>
                    <strong>Chantier ID :</strong> #{{ $project->id }}
                </div>
            </td>
        </tr>
    </table>

    {{-- SECTION 1: INFORMATIONS PROJET --}}
    <div class="section-title">1. Identification du Chantier</div>

    <table class="info-table">
        <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                <div class="info-card">
                    <div class="info-card-title">Informations Chantier</div>
                    <table class="project-info-table" style="margin-bottom: 0;">
                        <tr>
                            <td>Intitulé du chantier</td>
                            <td>{{ $project->title }}</td>
                        </tr>
                        <tr>
                            <td>Adresse des travaux</td>
                            <td>{{ $project->address ?? '-' }}@if($project->city), {{ $project->city }}@endif</td>
                        </tr>
                        <tr>
                            <td>Statut actuel</td>
                            <td>{{ $project->status ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td>Date de début</td>
                            <td>{{ $project->start_date ? \Carbon\Carbon::parse($project->start_date)->format('d/m/Y') : '-' }}</td>
                        </tr>
                        <tr>
                            <td>Date de fin prévue</td>
                            <td>{{ $project->end_date_planned ? \Carbon\Carbon::parse($project->end_date_planned)->format('d/m/Y') : '-' }}</td>
                        </tr>
                    </table>
                </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                <div class="info-card">
                    <div class="info-card-title">Parties Contractantes</div>
                    <table class="project-info-table" style="margin-bottom: 0;">
                        <tr>
                            <td>Maître d'Ouvrage</td>
                            <td>{{ $project->account->name ?? '-' }}</td>
                        </tr>
                        @if($project->account && $project->account->ice)
                        <tr>
                            <td>ICE Client</td>
                            <td>{{ $project->account->ice }}</td>
                        </tr>
                        @endif
                        @if($project->account && $project->account->city)
                        <tr>
                            <td>Ville Client</td>
                            <td>{{ $project->account->city }}</td>
                        </tr>
                        @endif
                        <tr>
                            <td>Maître d'Oeuvre</td>
                            <td>{{ $project->manager->name ?? 'BATIPLUS SARL' }}</td>
                        </tr>
                        <tr>
                            <td>Budget contractuel</td>
                            <td>{{ $project->budget ? number_format($project->budget, 2, ',', ' ') . ' DH' : '-' }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    {{-- SECTION 2: RÉCAPITULATIF DES TRAVAUX --}}
    <div class="section-title">2. Récapitulatif des Travaux Réalisés</div>

    <table class="stats-table">
        <tr>
            <td style="width: 33%; padding-right: 8px; vertical-align: top;">
                <div class="stat-box">
                    <div class="stat-number">{{ $tasksCompleted }}</div>
                    <div class="stat-label">Tâches terminées</div>
                </div>
            </td>
            <td style="width: 33%; padding: 0 4px; vertical-align: top;">
                <div class="stat-box">
                    <div class="stat-number">{{ $tasksTotal }}</div>
                    <div class="stat-label">Total des tâches</div>
                </div>
            </td>
            <td style="width: 33%; padding-left: 8px; vertical-align: top;">
                <div class="stat-box">
                    <div class="stat-number">{{ number_format($totalHours, 1) }}</div>
                    <div class="stat-label">Heures travaillées</div>
                </div>
            </td>
        </tr>
    </table>

    {{-- Tableau des tâches --}}
    @if($project->tasks->isNotEmpty())
    <table class="tasks-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Désignation de la tâche</th>
                <th style="width: 20%;">Statut</th>
                <th style="width: 15%;">Priorité</th>
                <th style="width: 25%;">Observations</th>
            </tr>
        </thead>
        <tbody>
            @foreach($project->tasks as $index => $task)
            <tr>
                <td class="text-center" style="color: #94a3b8;">{{ $index + 1 }}</td>
                <td><strong>{{ $task->title }}</strong></td>
                <td>
                    @if($task->status === 'Terminé' || $task->status === 'done')
                        <span class="status-badge status-done">Terminé</span>
                    @else
                        <span class="status-badge status-pending">{{ $task->status }}</span>
                    @endif
                </td>
                <td>{{ $task->priority ?? '-' }}</td>
                <td style="color: #64748b; font-size: 10px;">{{ Str::limit($task->description ?? '', 60) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="no-tasks">Aucune tâche enregistrée sur ce chantier.</div>
    @endif

    {{-- SECTION 3: BILAN HEURES --}}
    <div class="section-title">3. Bilan des Interventions</div>

    <table class="info-table">
        <tr>
            <td style="width: 50%; padding-right: 10px; vertical-align: top;">
                <div class="info-card">
                    <div class="info-card-title">Pointages Terrain</div>
                    <table class="project-info-table" style="margin-bottom: 0;">
                        <tr>
                            <td>Total heures déclarées</td>
                            <td><strong style="color: #2563eb; font-size: 14px;">{{ number_format($totalHours, 1) }} h</strong></td>
                        </tr>
                        <tr>
                            <td>Nombre d'interventions</td>
                            <td>{{ $project->workLogs->count() }} pointages</td>
                        </tr>
                        @if($project->workLogs->count() > 0)
                        <tr>
                            <td>Dernière intervention</td>
                            <td>{{ \Carbon\Carbon::parse($project->workLogs->sortByDesc('work_date')->first()->work_date)->format('d/m/Y') }}</td>
                        </tr>
                        @endif
                    </table>
                </div>
            </td>
            <td style="width: 50%; padding-left: 10px; vertical-align: top;">
                <div class="info-card">
                    <div class="info-card-title">Avancement Global</div>
                    <table class="project-info-table" style="margin-bottom: 0;">
                        <tr>
                            <td>Taux d'avancement</td>
                            <td>
                                @if($tasksTotal > 0)
                                    <strong>{{ round(($tasksCompleted / $tasksTotal) * 100) }}%</strong> des tâches terminées
                                @else
                                    <strong>N/A</strong>
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td>Tâches en cours</td>
                            <td>{{ $project->tasks->where('status', 'En cours')->count() }}</td>
                        </tr>
                        <tr>
                            <td>Tâches à faire</td>
                            <td>{{ $project->tasks->where('status', 'À faire')->count() }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    {{-- SECTION 4: DÉCLARATION DE RÉCEPTION --}}
    <div class="section-title">4. Déclaration de Réception</div>

    <div class="declaration-box">
        <p>
            <strong>Entre les soussignés :</strong>
        </p>
        <p>
            D'une part, <strong>{{ $project->account->name ?? 'Le Maître d\'Ouvrage' }}</strong>, ci-après dénommé « le Maître d'Ouvrage »,<br>
            D'autre part, <strong>BATIPLUS SARL</strong> représentée par <strong>{{ $project->manager->name ?? 'le Directeur Technique' }}</strong>, ci-après dénommé « le Maître d'Oeuvre »,
        </p>
        <p>
            Il est convenu et arrêté ce qui suit : Le Maître d'Ouvrage déclare <strong>réceptionner les travaux</strong> relatifs au chantier
            intitulé « <strong>{{ $project->title }}</strong> », situé à {{ $project->address ?? '...' }}@if($project->city), {{ $project->city }}@endif,
            ayant fait l'objet d'une commande au titre du contrat de travaux en date du
            {{ $project->start_date ? \Carbon\Carbon::parse($project->start_date)->format('d/m/Y') : '...' }}.
        </p>
        <p>
            La présente réception est prononcée <strong>avec / sans réserves</strong> (biffer la mention inutile).<br>
            Les réserves éventuelles sont mentionnées dans les observations des signataires ci-dessous.<br>
            Les travaux ont été réalisés conformément aux règles de l'art et aux normes marocaines en vigueur (NM, DTU, CCTG).
        </p>
        <p>
            Le présent PV est établi en deux (2) exemplaires originaux, dont un remis à chaque partie signataire.
        </p>
    </div>

    {{-- SECTION 5: SIGNATURES --}}
    <div class="section-title">5. Signatures des Parties</div>

    <table class="signatures-table">
        <tr>
            {{-- Signature Client --}}
            @php
                $clientSig = $project->signatures->filter(function($s) {
                    return in_array(strtolower($s->signatory_role ?? ''), ['client', 'maître d\'ouvrage', 'client (représentant)']);
                })->first() ?? $project->signatures->first();
            @endphp
            <td class="sig-col" style="padding-right: 15px;">
                <div class="sig-box">
                    <div class="sig-title">Le Maître d'Ouvrage (Client)</div>
                    <div class="sig-name-label">Nom & Prénom</div>
                    <div class="sig-name-value">
                        {{ $clientSig->client_name ?? '...................................................' }}
                    </div>
                    @if($clientSig && $clientSig->signatory_role)
                    <div class="sig-role-value">{{ $clientSig->signatory_role }}</div>
                    @endif

                    @if($clientSig && $clientSig->signature_data && Str::startsWith($clientSig->signature_data, 'data:image/'))
                        <div class="sig-image-container">
                            <img src="{{ $clientSig->signature_data }}" alt="Signature client" />
                        </div>
                    @else
                        <div class="sig-placeholder">[ Signature manuscrite / Cachet ]</div>
                        <div class="sig-line"></div>
                    @endif

                    @if($clientSig && $clientSig->notes)
                    <div style="font-size: 9px; color: #64748b; margin-top: 6px; font-style: italic;">
                        Réserves : {{ $clientSig->notes }}
                    </div>
                    @endif
                    <div style="font-size: 9px; color: #94a3b8; margin-top: 8px;">
                        Date : {{ $clientSig ? \Carbon\Carbon::parse($clientSig->signed_at)->format('d/m/Y') : '....../....../......' }}
                    </div>
                </div>
            </td>

            {{-- Signature Chef de Projet --}}
            @php
                $managerSig = $project->signatures->filter(function($s) {
                    return in_array(strtolower($s->signatory_role ?? ''), ['chef de chantier', 'chef de projet', 'maître d\'oeuvre', 'directeur technique']);
                })->first();
            @endphp
            <td class="sig-col" style="padding-left: 15px;">
                <div class="sig-box">
                    <div class="sig-title">Le Maître d'Oeuvre (Chef de Projet)</div>
                    <div class="sig-name-label">Nom & Prénom</div>
                    <div class="sig-name-value">
                        {{ $managerSig->client_name ?? ($project->manager->name ?? '...................................................') }}
                    </div>
                    @if($managerSig && $managerSig->signatory_role)
                    <div class="sig-role-value">{{ $managerSig->signatory_role }}</div>
                    @else
                    <div class="sig-role-value">Chef de chantier — BATIPLUS SARL</div>
                    @endif

                    @if($managerSig && $managerSig->signature_data && Str::startsWith($managerSig->signature_data, 'data:image/'))
                        <div class="sig-image-container">
                            <img src="{{ $managerSig->signature_data }}" alt="Signature chef de projet" />
                        </div>
                    @else
                        <div class="sig-placeholder">[ Signature manuscrite / Cachet ]</div>
                        <div class="sig-line"></div>
                    @endif

                    @if($managerSig && $managerSig->notes)
                    <div style="font-size: 9px; color: #64748b; margin-top: 6px; font-style: italic;">
                        Réserves : {{ $managerSig->notes }}
                    </div>
                    @endif
                    <div style="font-size: 9px; color: #94a3b8; margin-top: 8px;">
                        Date : {{ $managerSig ? \Carbon\Carbon::parse($managerSig->signed_at)->format('d/m/Y') : '....../....../......' }}
                    </div>
                </div>
            </td>
        </tr>
    </table>

    {{-- PIED DE PAGE --}}
    <div class="footer">
        BATIPLUS SARL — Société à Responsabilité Limitée au capital de 300 000 DH<br>
        RC Casablanca N° 456789 | IF 34567890 | Patente 56789012 | ICE 001987654321098<br>
        Zone Industrielle Aïn Sebaâ, Lot N° 12 — Casablanca 20250, Maroc<br>
        Document généré le {{ date('d/m/Y à H:i') }} — Réf. PV-{{ $project->id }}-{{ date('Ymd') }}<br>
        Ce document a valeur contractuelle conformément aux dispositions du Code des Obligations et Contrats (D.O.C.) marocain.
    </div>

</body>
</html>
