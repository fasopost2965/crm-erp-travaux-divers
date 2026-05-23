<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>PV de Réception — {{ $project->title }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; color: #1e293b; background: #fff; line-height: 1.5; }

  .page { padding: 28px 32px; }

  /* HEADER */
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1D4ED8; padding-bottom: 16px; margin-bottom: 20px; }
  .company-name { font-size: 22px; font-weight: bold; color: #1D4ED8; letter-spacing: 1px; }
  .company-sub { font-size: 9px; color: #64748b; margin-top: 2px; }
  .company-info { font-size: 8.5px; color: #475569; line-height: 1.7; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 16px; font-weight: bold; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
  .doc-title .doc-num { font-size: 9px; color: #64748b; margin-top: 4px; }
  .doc-title .doc-date { font-size: 9px; color: #1D4ED8; font-weight: bold; margin-top: 2px; }

  /* PROJECT INFO */
  .section { margin-bottom: 18px; }
  .section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1D4ED8; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }

  table.info-table { width: 100%; border-collapse: collapse; }
  table.info-table td { padding: 5px 8px; font-size: 9.5px; vertical-align: top; }
  table.info-table td.label { font-weight: bold; color: #64748b; width: 130px; }
  table.info-table td.value { color: #1e293b; }
  table.info-table tr:nth-child(even) td { background: #f8fafc; }

  /* KPI CARDS */
  .kpi-row { display: flex; gap: 10px; margin-bottom: 18px; }
  .kpi-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; text-align: center; }
  .kpi-card .kpi-value { font-size: 22px; font-weight: bold; color: #1D4ED8; }
  .kpi-card .kpi-label { font-size: 8.5px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; }
  .kpi-card.green .kpi-value { color: #059669; }
  .kpi-card.amber .kpi-value { color: #d97706; }

  /* TASKS TABLE */
  table.data-table { width: 100%; border-collapse: collapse; font-size: 9px; }
  table.data-table thead tr { background: #1D4ED8; color: #fff; }
  table.data-table thead th { padding: 7px 10px; text-align: left; font-weight: bold; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px; }
  table.data-table tbody tr:nth-child(even) { background: #f8fafc; }
  table.data-table tbody td { padding: 6px 10px; color: #334155; border-bottom: 1px solid #e2e8f0; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 8px; font-weight: bold; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-blue  { background: #dbeafe; color: #1e40af; }
  .badge-amber { background: #fef9c3; color: #92400e; }
  .badge-red   { background: #fee2e2; color: #991b1b; }
  .badge-slate { background: #f1f5f9; color: #475569; }

  /* DECLARATION */
  .declaration-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; background: #f8fafc; }
  .declaration-box p { font-size: 9.5px; color: #334155; line-height: 1.7; margin-bottom: 6px; }
  .declaration-box p:last-child { margin-bottom: 0; }

  /* SIGNATURES */
  .sig-row { display: flex; gap: 20px; margin-bottom: 18px; }
  .sig-block { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
  .sig-block .sig-header { font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 10px; }
  .sig-block .sig-name { font-size: 10px; font-weight: bold; color: #1e293b; margin-bottom: 2px; }
  .sig-block .sig-role { font-size: 8.5px; color: #64748b; margin-bottom: 10px; }
  .sig-block .sig-image { width: 100%; max-height: 70px; text-align: center; margin-bottom: 8px; }
  .sig-block .sig-image img { max-height: 70px; max-width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; background: #fff; }
  .sig-block .sig-line { border-top: 1.5px solid #cbd5e1; margin-top: 6px; padding-top: 5px; font-size: 8.5px; color: #94a3b8; }
  .sig-placeholder { height: 60px; border: 1px dashed #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 9px; margin-bottom: 8px; }

  /* FOOTER */
  .footer { border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 7.5px; color: #94a3b8; line-height: 1.6; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="company-name">BATIPLUS SARL</div>
      <div class="company-sub">Entreprise Générale de Construction & Travaux Publics</div>
      <div class="company-info" style="margin-top:8px;">
        ICE : 002754890000032 &nbsp;|&nbsp; RC : 45872 &nbsp;|&nbsp; IF : 18743650<br>
        Patente : 45208700 &nbsp;|&nbsp; CNSS : 7854321<br>
        Adresse : 45 Rue Ibn Sina, Quartier Industriel, Casablanca<br>
        Tél : +212 522 123 456 &nbsp;|&nbsp; contact@batiplus.ma
      </div>
    </div>
    <div class="doc-title">
      <h1>Procès-Verbal<br>de Réception</h1>
      <div class="doc-num">N° PVR-{{ str_pad($project->id, 5, '0', STR_PAD_LEFT) }}/{{ now()->year }}</div>
      <div class="doc-date">Édité le {{ now()->locale('fr')->isoFormat('D MMMM YYYY') }}</div>
    </div>
  </div>

  <!-- PROJECT INFO -->
  <div class="section">
    <div class="section-title">Informations du Chantier</div>
    <table class="info-table">
      <tr>
        <td class="label">Intitulé du chantier</td>
        <td class="value"><strong>{{ $project->title }}</strong></td>
        <td class="label">N° Chantier</td>
        <td class="value">PROJ-{{ str_pad($project->id, 4, '0', STR_PAD_LEFT) }}</td>
      </tr>
      <tr>
        <td class="label">Client / Maître d'ouvrage</td>
        <td class="value">{{ $project->account?->name ?? 'Non renseigné' }}</td>
        <td class="label">Conducteur de travaux</td>
        <td class="value">{{ $project->manager?->name ?? 'Non assigné' }}</td>
      </tr>
      <tr>
        <td class="label">Localisation</td>
        <td class="value">{{ $project->address ? $project->address . ', ' : '' }}{{ $project->city ?? '—' }}</td>
        <td class="label">Statut final</td>
        <td class="value"><strong>{{ $project->status }}</strong></td>
      </tr>
      <tr>
        <td class="label">Date de début</td>
        <td class="value">{{ $project->start_date ? \Carbon\Carbon::parse($project->start_date)->locale('fr')->isoFormat('D MMMM YYYY') : '—' }}</td>
        <td class="label">Date de fin planifiée</td>
        <td class="value">{{ $project->end_date_planned ? \Carbon\Carbon::parse($project->end_date_planned)->locale('fr')->isoFormat('D MMMM YYYY') : '—' }}</td>
      </tr>
      @if($project->budget)
      <tr>
        <td class="label">Budget HT</td>
        <td class="value"><strong>{{ number_format($project->budget, 2, ',', ' ') }} DH</strong></td>
        <td class="label"></td><td class="value"></td>
      </tr>
      @endif
    </table>
  </div>

  <!-- KPI STATS -->
  <div class="kpi-row">
    <div class="kpi-card green">
      <div class="kpi-value">{{ $tasksCompleted }}</div>
      <div class="kpi-label">Tâches réalisées</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">{{ $tasksTotal }}</div>
      <div class="kpi-label">Tâches totales</div>
    </div>
    <div class="kpi-card amber">
      <div class="kpi-value">{{ number_format($totalHours, 1) }}</div>
      <div class="kpi-label">Heures pointées</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">{{ $project->signatures->count() }}</div>
      <div class="kpi-label">Signatures</div>
    </div>
  </div>

  <!-- TASKS TABLE -->
  @if($project->tasks->count())
  <div class="section">
    <div class="section-title">Récapitulatif des Tâches</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Intitulé de la tâche</th>
          <th>Priorité</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        @foreach($project->tasks as $task)
        <tr>
          <td>{{ $loop->iteration }}</td>
          <td>{{ $task->title }}</td>
          <td>
            @php
              $pClass = match(strtolower($task->priority ?? '')) {
                'haute', 'urgente' => 'badge-red',
                'moyenne' => 'badge-amber',
                default => 'badge-slate'
              };
            @endphp
            <span class="badge {{ $pClass }}">{{ $task->priority ?? '—' }}</span>
          </td>
          <td>
            @php
              $sClass = match($task->status ?? '') {
                'Terminé' => 'badge-green',
                'En cours' => 'badge-blue',
                'Suspendu' => 'badge-red',
                default => 'badge-slate'
              };
            @endphp
            <span class="badge {{ $sClass }}">{{ $task->status ?? '—' }}</span>
          </td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>
  @endif

  <!-- WORK LOG SUMMARY -->
  @if($project->workLogs->count())
  <div class="section">
    <div class="section-title">Bilan des Heures de Travail</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Intervenant</th>
          <th>Date</th>
          <th>Heures</th>
          <th>Observations</th>
        </tr>
      </thead>
      <tbody>
        @foreach($project->workLogs->sortByDesc('work_date')->take(15) as $log)
        <tr>
          <td>{{ $log->user?->name ?? '—' }}</td>
          <td>{{ \Carbon\Carbon::parse($log->work_date)->locale('fr')->isoFormat('D MMM YYYY') }}</td>
          <td><strong>{{ number_format($log->hours_worked, 1) }}h</strong></td>
          <td>{{ Str::limit($log->description, 60) }}</td>
        </tr>
        @endforeach
      </tbody>
    </table>
    @if($project->workLogs->count() > 15)
    <p style="font-size:8.5px;color:#94a3b8;margin-top:5px;">* Seuls les 15 derniers pointages sont affichés.</p>
    @endif
  </div>
  @endif

  <!-- DECLARATION -->
  <div class="section">
    <div class="section-title">Déclaration de Réception</div>
    <div class="declaration-box">
      <p>
        Nous soussignés, le représentant du maître d'ouvrage et le responsable de l'entreprise BATIPLUS SARL,
        déclarons avoir procédé, en date du {{ now()->locale('fr')->isoFormat('D MMMM YYYY') }},
        à la réception des travaux relatifs au chantier <strong>{{ $project->title }}</strong>
        situé à <strong>{{ $project->city ?? 'l\'adresse convenue' }}</strong>.
      </p>
      <p>
        Les travaux ont été réalisés conformément aux plans, prescriptions techniques et au contrat de marché.
        {{ $tasksCompleted }} tâche(s) sur {{ $tasksTotal }} ont été réceptionnées avec {{ number_format($totalHours, 1) }} heures de travail documentées.
      </p>
      <p>
        La présente réception est prononcée <strong>sans réserve</strong>, sauf mention contraire formulée dans les observations ci-dessous,
        et vaut point de départ des délais de garantie légaux prévus par la législation marocaine en vigueur (Dahir des Obligations et Contrats).
      </p>
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="section">
    <div class="section-title">Signatures des Parties</div>
    <div class="sig-row">
      @php
        $clientSig  = $project->signatures->where('signatory_role', 'client')->first();
        $managerSig = $project->signatures->whereIn('signatory_role', ['chef_chantier', 'manager'])->first()
                   ?? $project->signatures->whereNull('signatory_role')->first();
      @endphp

      <!-- Client Signature -->
      <div class="sig-block">
        <div class="sig-header">Maître d'ouvrage (Client)</div>
        <div class="sig-name">{{ $clientSig?->client_name ?? $project->account?->name ?? 'Maître d\'ouvrage' }}</div>
        <div class="sig-role">{{ $clientSig?->signatory_role ? 'Rôle : ' . $clientSig->signatory_role : 'Représentant légal' }}</div>
        <div class="sig-image">
          @if($clientSig?->signature_data && Str::startsWith($clientSig->signature_data, 'data:image/'))
            <img src="{{ $clientSig->signature_data }}" alt="Signature client" />
          @else
            <div class="sig-placeholder">Signature non disponible</div>
          @endif
        </div>
        <div class="sig-line">
          Date : {{ $clientSig?->signed_at ? \Carbon\Carbon::parse($clientSig->signed_at)->locale('fr')->isoFormat('D MMM YYYY') : '____/____/________' }}
        </div>
        @if($clientSig?->notes)
        <div style="margin-top:5px;font-size:8.5px;color:#64748b;">Note : {{ $clientSig->notes }}</div>
        @endif
      </div>

      <!-- Manager Signature -->
      <div class="sig-block">
        <div class="sig-header">Chef de Chantier (BATIPLUS)</div>
        <div class="sig-name">{{ $managerSig?->signer?->name ?? $project->manager?->name ?? 'Chef de Chantier' }}</div>
        <div class="sig-role">{{ $managerSig?->signatory_role ? 'Rôle : ' . $managerSig->signatory_role : 'Conducteur de travaux' }}</div>
        <div class="sig-image">
          @if($managerSig?->signature_data && Str::startsWith($managerSig->signature_data, 'data:image/'))
            <img src="{{ $managerSig->signature_data }}" alt="Signature conducteur" />
          @else
            <div class="sig-placeholder">Signature non disponible</div>
          @endif
        </div>
        <div class="sig-line">
          Date : {{ $managerSig?->signed_at ? \Carbon\Carbon::parse($managerSig->signed_at)->locale('fr')->isoFormat('D MMM YYYY') : '____/____/________' }}
        </div>
        @if($managerSig?->notes)
        <div style="margin-top:5px;font-size:8.5px;color:#64748b;">Note : {{ $managerSig->notes }}</div>
        @endif
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <strong>BATIPLUS SARL</strong> — RC 45872 Casablanca — ICE 002754890000032 — IF 18743650 — CNSS 7854321<br>
    Ce document est un procès-verbal officiel de réception de travaux au sens de la législation marocaine.<br>
    Généré automatiquement via Atlas Works ERP — {{ now()->locale('fr')->isoFormat('D MMMM YYYY [à] HH:mm') }}
  </div>

</div>
</body>
</html>
