import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export class PrismaErrorHandler {
  private static readonly errorHandlers: Record<
    string,
    (error: Prisma.PrismaClientKnownRequestError) => never
  > = {
    // Constraint única violada
    P2002: (error) => {
      const targetFields = (error.meta?.target as string[] | undefined)?.join(', ') ?? 'desconhecido';
      const uniqueConstraint = error.meta?.constraint ?? 'desconhecida';
      throw new ConflictException(
        `Registro duplicado. Violação de constraint única "${uniqueConstraint}" nos campos: ${targetFields}.`,
      );
    },

    // Violação de chave estrangeira
    P2003: (error) => {
      const fieldName = error.meta?.field_name ?? 'desconhecido';
      throw new BadRequestException(`Violação de chave estrangeira no campo: ${fieldName}.`);
    },

    // Valor muito longo
    P2000: (error) => {
      const colName = error.meta?.column_name ?? 'desconhecido';
      throw new BadRequestException(`Valor muito longo para o campo: ${colName}.`);
    },

    // Registro relacionado não encontrado
    P2001: (error) => {
      const notFoundConstraint = error.meta?.constraint ?? 'desconhecida';
      throw new NotFoundException(`Registro relacionado não encontrado na condição: ${notFoundConstraint}.`);
    },

    // Restrições de banco violadas
    P2004: (error) => {
      const reason = error.meta?.reason ?? 'desconhecida';
      throw new ForbiddenException(`Restrições de banco de dados violadas: ${reason}.`);
    },

    // Violação de constraint nula
    P2011: (error) => {
      const nullConstraint = error.meta?.constraint ?? 'desconhecida';
      throw new BadRequestException(`Violação de constraint nula: ${nullConstraint}.`);
    },

    // Valor obrigatório ausente
    P2012: (error) => {
      const argumentName = error.meta?.argument_name ?? 'desconhecido';
      throw new BadRequestException(`Valor obrigatório ausente: ${argumentName}.`);
    },

    // Relação obrigatória violada
    P2014: (error) => {
      const relationName = error.meta?.relation_name ?? 'desconhecida';
      const parentName = error.meta?.parent_name ?? 'desconhecido';
      const childName = error.meta?.child_name ?? 'desconhecido';
      throw new BadRequestException(
        `A mudança violaria a relação obrigatória '${relationName}' entre os modelos '${parentName}' e '${childName}'.`,
      );
    },

    // Registro relacionado não encontrado entre modelos
    P2015: (error) => {
      const modelAName = error.meta?.model_a_name ?? 'desconhecido';
      const modelBName = error.meta?.model_b_name ?? 'desconhecido';
      throw new NotFoundException(
        `Registro relacionado não encontrado entre '${modelAName}' e '${modelBName}'.`,
      );
    },

    // Valor fora do intervalo
    P2020: (error) => {
      const outOfRangeCol = error.meta?.column_name ?? 'desconhecido';
      throw new BadRequestException(`Valor fora do intervalo para o tipo no campo: ${outOfRangeCol}.`);
    },

    // Tabela não existe
    P2021: (error) => {
      const table = error.meta?.table ?? 'desconhecida';
      throw new InternalServerErrorException(`Tabela não existe no banco de dados: ${table}.`);
    },

    // Coluna não existe
    P2022: (error) => {
      const column = error.meta?.column ?? 'desconhecido';
      throw new InternalServerErrorException(`Coluna não existe no banco de dados: ${column}.`);
    },

    // Operação falhou - registro não encontrado
    P2025: (error) => {
      const cause = error.meta?.cause ?? 'desconhecida';
      throw new NotFoundException(`Operação falhou: ${cause}.`);
    },
  };

  static handle(error: unknown, defaultMessage: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const handler = this.errorHandlers[error.code];
      
      if (handler) {
        handler(error);
      }

      // Erro do Prisma não mapeado
      throw new BadRequestException(`${defaultMessage}: ${error.message} (Código: ${error.code})`);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException(`Erro de validação: ${error.message}`);
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw new InternalServerErrorException('Erro crítico no banco de dados.');
    }

    // Erro desconhecido
    throw new InternalServerErrorException(
      defaultMessage,
      error instanceof Error ? error.message : String(error),
    );
  }
}

