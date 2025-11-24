import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new user",
    description: "Create a new user account (alternative to /auth/register)",
  })
  @ApiResponse({
    status: 201,
    description: "User successfully created",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        dateOfBirth: "1992-08-20",
        gender: "female",
        bio: "Passionate about art and travel",
        interests: ["art", "travel", "music"],
        profilePictureUrl: "https://example.com/avatar2.jpg",
        isActive: true,
        isProfileComplete: true,
        lastActiveAt: "2025-11-24T10:30:00Z",
        createdAt: "2025-11-24T09:00:00Z",
        updatedAt: "2025-11-24T10:30:00Z",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    schema: {
      example: {
        statusCode: 400,
        message: ["email must be an email"],
        error: "Bad Request",
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get all users",
    description: "Retrieve a list of all users (admin functionality)",
  })
  @ApiResponse({
    status: 200,
    description: "List of users retrieved successfully",
    schema: {
      example: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "john.doe@example.com",
          name: "John Doe",
          dateOfBirth: "1990-05-15",
          gender: "male",
          bio: "I love hiking and photography",
          interests: ["hiking", "photography"],
          isActive: true,
          isProfileComplete: true,
          lastActiveAt: "2025-11-24T10:30:00Z",
          createdAt: "2025-11-24T09:00:00Z",
          updatedAt: "2025-11-24T10:30:00Z",
        },
      ],
    },
  })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Retrieve the profile of the currently authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "john.doe@example.com",
        name: "John Doe",
        dateOfBirth: "1990-05-15",
        gender: "male",
        bio: "I love hiking and photography",
        interests: ["hiking", "photography", "cooking"],
        profilePictureUrl: "https://example.com/avatar.jpg",
        isActive: true,
        isProfileComplete: true,
        lastActiveAt: "2025-11-24T10:30:00Z",
        createdAt: "2025-11-24T09:00:00Z",
        updatedAt: "2025-11-24T10:30:00Z",
      },
    },
  })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get user by ID",
    description: "Retrieve a specific user by their ID",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "john.doe@example.com",
        name: "John Doe",
        dateOfBirth: "1990-05-15",
        gender: "male",
        bio: "I love hiking and photography",
        interests: ["hiking", "photography"],
        isActive: true,
        isProfileComplete: true,
        lastActiveAt: "2025-11-24T10:30:00Z",
        createdAt: "2025-11-24T09:00:00Z",
        updatedAt: "2025-11-24T10:30:00Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        statusCode: 404,
        message: "User not found",
        error: "Not Found",
      },
    },
  })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Update current user profile",
    description: "Update the profile of the currently authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "Profile updated successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "john.doe@example.com",
        name: "John Doe",
        dateOfBirth: "1990-05-15",
        gender: "male",
        bio: "Updated bio: I love hiking, photography, and coding",
        interests: ["hiking", "photography", "coding"],
        profilePictureUrl: "https://example.com/new-avatar.jpg",
        isActive: true,
        isProfileComplete: true,
        lastActiveAt: "2025-11-24T10:30:00Z",
        createdAt: "2025-11-24T09:00:00Z",
        updatedAt: "2025-11-24T10:35:00Z",
      },
    },
  })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Update user by ID",
    description: "Update a specific user by their ID (admin functionality)",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "john.doe@example.com",
        name: "John Doe",
        dateOfBirth: "1990-05-15",
        gender: "male",
        bio: "Updated bio",
        interests: ["hiking", "photography"],
        isActive: true,
        isProfileComplete: true,
        lastActiveAt: "2025-11-24T10:30:00Z",
        createdAt: "2025-11-24T09:00:00Z",
        updatedAt: "2025-11-24T10:35:00Z",
      },
    },
  })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("upload-avatar")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Upload user avatar",
    description: "Upload a profile picture for the current user",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Avatar image file",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image file (JPEG, PNG, etc.)",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Avatar uploaded successfully",
    schema: {
      example: {
        message: "Avatar uploaded successfully",
        avatarUrl: "https://example.com/uploads/avatar-123.jpg",
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  uploadAvatar(@Request() req, @UploadedFile() file: any) {
    // Implement file upload logic
    return { message: "Avatar uploaded successfully" };
  }

  @UseGuards(JwtAuthGuard)
  @Delete("account")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Delete current user account",
    description: "Delete the account of the currently authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "Account deleted successfully",
    schema: {
      example: {
        message: "Account deleted successfully",
      },
    },
  })
  deleteAccount(@Request() req) {
    return this.usersService.remove(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Delete user by ID",
    description: "Delete a specific user by their ID (admin functionality)",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "User deleted successfully",
    schema: {
      example: {
        message: "User deleted successfully",
      },
    },
  })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
