"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserResponseDto {
    id;
    email;
    name;
    companyName;
    pib;
    mbr;
    activityCode;
    address;
    city;
    municipality;
    phone;
    createdAt;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'User' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'My Company', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456789', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "pib", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456789', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "mbr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6201', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "activityCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main St', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Beograd', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Serbia', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "municipality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+381612345678', nullable: true }),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=user-response.dto.js.map