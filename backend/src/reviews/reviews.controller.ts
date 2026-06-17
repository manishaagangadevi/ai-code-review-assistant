import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, SearchReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req, @Query() query: SearchReviewDto) {
    return this.reviewsService.findAll(req.user.sub, query);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.reviewsService.findOne(req.user.sub, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.reviewsService.remove(req.user.sub, id);
  }
}