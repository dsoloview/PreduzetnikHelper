import { ForbiddenException } from '@nestjs/common';

interface Ownable {
    userId: string;
}

export const assertOwnership = (entity: Ownable, userId: string, entityName: string): void => {
    if (entity.userId !== userId) {
        throw new ForbiddenException(`Access denied to ${entityName}`);
    }
};
