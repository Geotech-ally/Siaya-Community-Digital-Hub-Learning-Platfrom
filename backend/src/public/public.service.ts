import { Injectable } from '@nestjs/common';
import { CourseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async home() {
    const [featuredCourses, totalCourses, totalLearners, departments] = await Promise.all([
      this.prisma.course.findMany({
        where: { status: CourseStatus.PUBLISHED },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          department: true,
          _count: { select: { enrollments: true, modules: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 6,
      }),
      this.prisma.course.count({ where: { status: CourseStatus.PUBLISHED } }),
      this.prisma.user.count({ where: { role: 'LEARNER', isActive: true } }),
      this.prisma.course.groupBy({
        by: ['department'],
        where: { status: CourseStatus.PUBLISHED },
        _count: { _all: true },
      }),
    ]);

    return {
      stats: {
        totalCourses,
        totalLearners,
        totalDepartments: departments.length,
      },
      departments: departments.map((department) => ({
        department: department.department,
        courseCount: department._count._all,
      })),
      featuredCourses: featuredCourses.map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        department: course.department,
        enrolledCount: course._count.enrollments,
        moduleCount: course._count.modules,
      })),
    };
  }
}
