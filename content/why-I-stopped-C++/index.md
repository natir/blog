+++
template = "page.html"
title = "Why I stopped C++"
date =  2018-10-18
draft = true
tags = ["bioinformatics", "language"]
+++

I have the feeling generaly bioinformatician uses two languages, a language for small scripts, rapid analysis, prototyping (usually an interpreted language) and another when we have performance needs (usually a compiled language).

Until what time these two languages for me was python and C++. If you follow me on twitter you probably saw my last two tools [yacrd](https://github.com/natir/yacrd) and [fpa](https://github.com/natir/fpa), these two tools were written in Rust.

# C++

C++ have very good performance in terme of memory usage and computation time, compare to other language for same tasks, but C++ have two huge problem.

First it's easy to create memory leak in C++. You have a huge control to how memory are manage but if you are not very careful about how to allocate and free your memory, you probably create a memory leak and you may also waste a lot of time solving them. Use of intelligent pointers helps a lot but since their use is mandatory it is always very easy to create a memory leak.

The second is dependency management, it's easy, there are none. When you want to integrate a dependency you assume that it is sufficiently used to be present in most of the systems. Or you integrate it directly into your code, which poses several problems, you have to update your dependency yourself, it makes the compilation of your tools longer and more complex, it also manages the dependencies of your dependencies, and it makes your tools potentially more difficult to package properly.

[biicode](https://biicode.github.io/biicode/) try to solve this issue, but project seems dead, if you now other tools I am interst

# Rust

Recently I write a little programme to remove chimera in long read dataset [yacrd](https://github.com/natir/yacrd) the first prototype is write in Python it's work well but the runtime isn't very cool. I rewrite yacrd in C++, durring developement I use smart pointer and valgrind, so I hope I didn't create a memory leak but I'm not sure. But after a while I thought it would be nice to be able to take compressed files in. After any search I can interface the C code of the compression libraries with my C++ code, or use the kseq.h but only support gzip compression.

I had discovered Rust 3 years earlier and it was a long time since I wanted to try this language so why not see if it can solve my problems. 

## Dependancy management

The dependancy management in Rust is just to easy, Cargo is the compilation, test, benchmark, dependency, packaging, *what you want* manager of Rust. 

When creating a Rust project, the recommended way is use the command `Cargo init {project_name}` which will automatically create a folder with `{project_name}` which looks like this:

```
{project_name}
├── Cargo.toml
└── src
    └── main.rs
```

Cargo.toml is file containt many information about your project and a very important section `[dependencies]` you want add a dependencies in your project go to [crates.io](https://crates.io), *crates is name of package/module in Rust*, found crates they make want you want add it in your section dependencies of your Cargo.toml and that it, cargo download and build your dependency (and dependency of your dependency) for you, your contibutor and user. An easiest dependency systeme than python in compiled language, what you want more !!!

## No more memory leak

A main principe of Rust is if your code compile it will not contains any memory leak [^1], Rust do that with a new system  


## Same perf

[The Computer Benchmark Language](https://benchmarksgame-team.pages.debian.net/benchmarksgame/) is a cool project they try to compare performance of many language:

{{ plotly(id="cputime", src="cputime.js") }}

{{ plotly(id="memory", src="memory.js") }}

Rust is equivalent or better than c++ in cpu time and memory usage.


## Rust trouble

// pro

// same perf
// no memory leak
// dependancy management perfect

// cos
// young language


# Conclusion

# Rust history

Rust was created by Graydon Hoare developer at Mozzila, it became an official Mozzila project in 2010. Rust is a multi-paradigm compiled language, such as c++, then why create a new language? The main problem of C++ is memory leaks, my colleague spent several days to eliminate all memory problems from a software. This task are hard, consume many time and you can't be sure if it's down.

A number of languages solve this problem with collector's gabrage, each language has its own and we can discuss during many hours of their comparative interest but there is one thing I am on it that always has an impact on performance and have memory cost.

# Pro 


## cargo

cargo is an usefull tools, it's main tool you use if you make rust. cargo a compile, test, benchmark, dependency, packaging manager !!


Crates.io

Bioconda

## comunity

The rust community is realy open and all people 

# Con

## new notion

Rust contains many new notion.

## new language less contributor

## External resource

- [Rust vs C++](https://www.slideshare.net/corehard_by/rust-vs-c) slide create for C++ CoreHard Conference
- [The Computer benchmark game](https://benchmarksgame-team.pages.debian.net/benchmarksgame/)


[^1]: Is not True it's just very very hard to create memory leak, if you realy want create a memory leak it's possible, with `unsafe` keyword or if you follow this [page method](https://doc.rust-lang.org/nomicon/leaking.html) but who want do think like that ? 

