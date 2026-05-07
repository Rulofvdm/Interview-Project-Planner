import { Directive, HostBinding, Input } from '@angular/core'

type SkeletonType = 'text' | 'icon' | 'user-image-circle'
type SkeletonConfig = {
  loading?: boolean
  type?: SkeletonType
  enabled?: boolean
}

@Directive({
  selector: '[appSkeleton]',
  standalone: true,
})
export class SkeletonDirective {
  private _enabled = true
  private _loading = false
  private _type: SkeletonType = 'text'

  @Input('appSkeleton')
  set appSkeleton(value: SkeletonConfig | null | undefined) {
    if (this.isConfig(value)) {
      this._enabled = value.enabled === undefined ? true : value.enabled
      this._loading = value.loading === undefined ? false : value.loading
      this._type = value.type === undefined ? 'text' : this.normalizeType(value.type)
    } else {
      this._enabled = value === undefined ? true : Boolean(value)
      this._loading = false
      this._type = 'text'
    }
  }

  @HostBinding('class.app-skeleton')
  get skeletonBaseClass(): boolean {
    return this._enabled
  }

  @HostBinding('class.app-skeleton--loading')
  get skeletonLoadingClass(): boolean {
    return this._enabled && this._loading
  }

  @HostBinding('class.app-skeleton--text')
  get skeletonTextClass(): boolean {
    return this._enabled && this._loading && this._type === 'text'
  }

  @HostBinding('class.app-skeleton--icon')
  get skeletonIconClass(): boolean {
    return this._enabled && this._loading && this._type === 'icon'
  }

  @HostBinding('class.app-skeleton--user-image-circle')
  get skeletonUserImageCircleClass(): boolean {
    return this._enabled && this._loading && this._type === 'user-image-circle'
  }

  private normalizeType(value: SkeletonType | null | undefined): SkeletonType {
    if (value === 'user-image-circle' || value === 'text') {
      return value
    }
    return 'text'
  }

  private isConfig(value: unknown): value is SkeletonConfig {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
