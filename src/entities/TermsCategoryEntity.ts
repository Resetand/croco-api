import { BaseEntity } from 'src/entities/BaseEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export const locales = ['ru', 'en'] as const;
export type Locale = typeof locales[number];

@Entity('term_categories')
export class TermsCategoryEntity extends BaseEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('text')
    name!: string;

    @Column('text')
    locale: Locale;
}
