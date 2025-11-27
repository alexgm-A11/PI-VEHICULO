import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Vehiculo } from '../../models/vehiculo';
import { Estado } from '../../models/estado';
import { VehiculoService } from '../../services/vehiculo';
import { EstadoService } from '../../services/estado';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Navbar],
  templateUrl: './vehiculo.html',
  styleUrls: ['./vehiculo.css']
})
export class VehiculoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehiculoService = inject(VehiculoService);
  private estadoService = inject(EstadoService);

  vehiculos: Vehiculo[] = [];
  estados: Estado[] = [];
  tituloModal = 'Nuevo Vehículo';
  editId: number | null = null;

  isCreating = false;

  // Campos de búsqueda
  searchPlaca: string = '';
  searchModelo: string = '';
  searchAno: number | null = null;

  loading: boolean = false;

  form = this.fb.group({
    placa: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    modelo: ['', [Validators.required, Validators.minLength(2)]],
    capacidad: [1, [Validators.required, Validators.min(1)]],
    altura: [0, [Validators.required, Validators.min(0)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    estadoId: [null as number | null, [Validators.required]]
  });

  @ViewChild('modal') modalRef!: ElementRef<HTMLDivElement>;
  private bsModal: any;

  ngOnInit(): void {
    this.cargarEstados();
  }

  private cargarEstados(): void {
    this.estadoService.getAll().subscribe({
      next: (estados) => {
        this.estados = estados;
        this.listar();
      },
      error: () => {
        alert('⚠️ No se pudieron cargar los estados.');
        this.listar();
      }
    });
  }

  listar(): void {
    this.vehiculoService.getAll().subscribe({
      next: (vehiculos) => {
        this.vehiculos = vehiculos;
      },
      error: () => {
        alert('No se pudieron cargar los vehículos.');
      }
    });
  }

  // 🔍 CORREGIDO: une todos los filtros en un solo string para el backend
  buscar(): void {
    this.loading = true;

    const filtro =
      `${this.searchPlaca ?? ''} ${this.searchModelo ?? ''} ${this.searchAno ?? ''}`.trim();

    this.vehiculoService.buscar(filtro).subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.loading = false;
      }
    });
  }

  getEstadoNombre(estadoId: number | undefined): string {
    if (estadoId == null) return '—';
    return this.estados.find(e => e.id === estadoId)?.estado || 'Desconocido';
  }

  compareEstados = (a: number | null, b: number | null): boolean => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return a === b;
  }

  abrirNuevo(): void {
    this.tituloModal = 'Nuevo Vehículo';
    this.editId = null;
    this.isCreating = true;
    this.form.reset({
      placa: '',
      modelo: '',
      capacidad: 1,
      altura: 0,
      precio: 0,
      estadoId: 1
    });
    this.showModal();
  }

  abrirEditar(vehiculo: Vehiculo): void {
    if (!vehiculo.id) {
      alert('Vehículo sin ID. No se puede editar.');
      return;
    }
    this.tituloModal = 'Editar Vehículo';
    this.editId = vehiculo.id;
    this.isCreating = false;
    this.form.patchValue({
      placa: vehiculo.placa ?? '',
      modelo: vehiculo.modelo ?? '',
      capacidad: vehiculo.capacidad ?? 1,
      altura: vehiculo.altura ?? 1,
      precio: vehiculo.precio ?? 1,
      estadoId: vehiculo.estadoId ?? null
    });
    this.showModal();
  }

  guardar(): void {
    if (this.form.invalid) return;

    const dto: Vehiculo = this.form.value as Vehiculo;

    const obs = this.editId
      ? this.vehiculoService.update(this.editId, dto)
      : this.vehiculoService.create(dto);

    obs.subscribe({
      next: () => {
        this.hideModal();
        this.listar();
      },
      error: (err) => {
        console.error('❌ Error al guardar:', err);
        alert('Error al guardar el vehículo.');
      }
    });
  }

  private showModal(): void {
    const el = this.modalRef.nativeElement;
    // @ts-ignore
    this.bsModal = new bootstrap.Modal(el);
    this.bsModal.show();
  }

  private hideModal(): void {
    this.bsModal?.hide();
  }

  getFilteredEstados(): Estado[] {
    if (this.isCreating) {
      return this.estados.filter(e => e.estado === 'Activo');
    }
    return this.estados;
  }
}
