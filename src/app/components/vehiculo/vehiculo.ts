import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Vehiculo } from '../../models/vehiculo';
import { Estado } from '../../models/estado'; 
import { VehiculoService } from '../../services/vehiculo';
import { EstadoService } from '../../services/estado'; 
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar], 
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

  // Flag para controlar si estamos creando un vehículo
  isCreating = false;

  // Restaurado 'precio' al formulario
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

  getEstadoNombre(estadoId: number | undefined): string {
    if (estadoId == null) return '—';
    return this.estados.find(e => e.id === estadoId)?.estado || 'Desconocido';
  }

  // Comparación robusta para el select [compareWith]
  compareEstados = (a: number | null, b: number | null): boolean => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return a === b;
  }

  abrirNuevo(): void {
    this.tituloModal = 'Nuevo Vehículo';
    this.editId = null;
    this.isCreating = true;  // Establecer que estamos creando
    this.form.reset({
      placa: '',
      modelo: '',
      capacidad: 1,
      altura: 0,
      precio: 0,
      estadoId: 1  // Asegurarse de que por defecto sea "Activo"
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
    this.isCreating = false;  // Establecer que estamos editando
    this.form.patchValue({
      placa: vehiculo.placa ?? '',
      modelo: vehiculo.modelo ?? '',
      capacidad: vehiculo.capacidad ?? 1,
      altura: vehiculo.altura ?? 0,
      precio: vehiculo.precio ?? 0,
      estadoId: vehiculo.estadoId ?? null
    });
    this.showModal();
  }

  guardar(): void {
    if (this.form.invalid) return;

    // Incluir 'precio' en el DTO que se va a enviar
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

  // Método para filtrar los estados en el formulario
  getFilteredEstados(): Estado[] {
    if (this.isCreating) {
      return this.estados.filter(e => e.estado === 'Activo');
    }
    return this.estados;
  }
}
