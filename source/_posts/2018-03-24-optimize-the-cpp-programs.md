---
title: 优化 C++ 程序性能的几种方法
date: 2018-03-24 15:55:50
tags:
  - C++
  - 性能优化
---

C/C++ 的一些特性使得它们成为高性能软件的首选语言，然而如果没有利用好其语言特性，便会无法达到其最高性能。由于 CPU 和内存往往成为性能瓶颈，优化的重点也在于这两方面。下面会讨论如何针对这两个方向进行优化。
<!--more-->
现代 CPU 由于缓存，流水线和架构之类的升级，性能对比从前已经有了极大的提升。而在图形和视音频处理中，应用最广泛的便是 CPU 提供的 SIMD 技术（Single Instruction Multiple Data，中文：单指令流多数据流）。通过使用 SIMD，能够大幅提升相关运算的性能。比如在 Intel CPU 的 SSE 指令集中，`addps ` 指令可以将打包进 128位 XMM 寄存器的 4 个单精度浮点数（32位 float）并行相加，在 Skylake 架构上，`addps` 一般仅需 4 个时钟周期即可完成，而且其吞吐量为 0.5，即在一个时钟周期可执行两次 `addps` 指令。Intel 还提供了 C 风格的内部函数（Intel intrinsic instructions）来使用 SIMD，从而无需手动书写汇编代码。并且使用内部函数，可以让编译器有更大的优化空间。下面是一个使用内部函数的简单例子：

```c
// Please compile with gcc or clang
#include <xmmintrin.h>	// _mm_store_ps(), _mm_add_ps(), _mm_load_ps()
#include <stdio.h>

__attribute__((aligned(16))) float A[] = {1.0f, 1.0f, 2.0f, 2.0f};
__attribute__((aligned(16))) float B[] = {3.0f, 3.0f, 4.0f, 4.0f};
__attribute__((aligned(16))) float C[] = {0.0f, 0.0f, 0.0f, 0.0f};

int main(void)
{
	__m128 a = _mm_load_ps(&A[0]);
	__m128 b = _mm_load_ps(&B[0]);

	__m128 s = _mm_add_ps(a, b);
	_mm_store_ps(&C[0], s);

	printf("%g %g %g %g\n",C[0], C[1], C[2], C[3]);
}
```

上面使用的 SSE 指令展现出一个限制，就是需要考虑内存对齐问题。尽管有可以存取未对齐元素的内部函数（比如，_mm_loadu_ps(), _mm_storeu_ps()），但对齐的内存读写往往能带来更好的性能。

内存对性能影响有两个方面：一是动态内存分配/释放对性能的影响；二是内存编排的合理性对性能的影响。

首先，C++ 提供了 new/delete 来执行动态内存分配/释放。然而由于种种原因，使用 new/delete 分配/释放内存的是低效的。因此，尽量避免动态内存分配，或使用自定义分配器从预先分配好的大块内存中完成分配请求，可以减少内存分配/释放对性能的影响。

在编写代码的时候，是否考虑 CPU 如何处理数据以及代码，对性能会有很大的影响。比起在内存中排布成松散的碎片状，如果数据在内存中以紧凑连续的方式排布，往往处理起来会高效得多。因为 CPU 在处理数据时，会尽可能地读取相关数据进入缓存，代码也是一样的道理。在性能关键处，代码应当足够简单，避免函数调用，以提高指令缓存命中率。

由于接触程序性能优化的时间并不久，上面所述内容也许不够严谨，但可供初次涉及此领域的同学参考。限于篇幅，内存读写优化这部分也就没有过多介绍。希望对性能优化理解更深入后，有机会可以继续写一些相关内容。

 - 推荐阅读：

  1. [Intel Intrinsics Guide](https://software.intel.com/sites/landingpage/IntrinsicsGuide/)
  2. [Instruction tables](http://www.agner.org/optimize/instruction_tables.pdf "Lists of instruction latencies, throughputs and micro-operation breakdowns for Intel, AMD
and VIA CPUs")
