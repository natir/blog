+++
template = "page.html"
title = "Uncorrected long-read misassemblies"
date = 2019-08-23
draft = true
tags = ["long-read", "assembly", "evaluation"]
+++

# TODO

- **More logical link between part**
- **Resume part at begin**

# Introduction

I think all the people who have ever done a genome assembly one day say: "Ok my assembly was cool, but how I can be sure it's the best possible one and they didn't contain many errror ?"

We have many technics to evaluate the quality of assembly (isn't a complete review sorry):
- with only assembly information:
  + with [N50 family metrics](https://doi.org/10.1089/cmb.2017.0013)
  + analysis of read remapping against assembly [ASMOValidate](http://amos.sourceforge.net/wiki/index.php/Amosvalidate), [REAPR](https://www.sanger.ac.uk/science/tools/reapr), [FRCbam](https://github.com/vezzi/FRC_align), [Pilon](https://github.com/broadinstitute/pilon/wiki), [VALET](https://www.cbcb.umd.edu/software/valet)
  + by computing the probability of the reads dataset can be generate from the assembly ([ALE](https://doi.org/10.1093/bioinformatics/bts723), [CGAL](https://doi.org/10.1186/gb-2013-14-1-r8), [LAP](https://doi.org/10.1186/1756-0500-6-334))
- by using external information: 
  + count the number of core gene present in assembly, [BUSCO](https://busco.ezlab.org/)
  + transcriptome information, [for example, *Bos taurus* genome validation](https://doi.org/10.1186/gb-2009-10-4-r42)
  + synteny information [Lui et al](https://doi.org/10.1186/s12859-018-2026-4)
  + map assembly against a near genome, [quast](https://doi.org/10.1093/bioinformatics/btt086)
  + map assembly against the reference genome
  
If you use quast to reference genome, you have a reference genome, so why you want perform an assembly ?

The main case where we perform something like that was when we want to evaluate different assembly pipeline on the same read data set. To evaluate a completely new assembly pipeline, test a different set of parameters, evaluate the impact of add or change a tools in an assembly pipeline.

Quast was a very useful tool and they integrate now many other assembly evaluating tools (BUSCO, [GeneMark](http://exon.gatech.edu/GeneMark/), [GlimmerHMM](https://doi.org/10.1093/bioinformatics/bth315), [barnap](https://github.com/tseemann/barrnap))

Recently, with Rayan Chikhi and Jean-Stéphane Varré, we publish a [preprint](https://www.biorxiv.org/content/10.1101/674036v2) about [yacrd](https://github.com/natir/yacrd/) and [fpa](https://github.com/natir/fpa), two standalone tools they can be introduced in assembly pipeline to remove very bad reads region and filter out low-quality overlap. We evaluate the effect of this tools on without correction long-reads assembly pipeline ([miniasm](https://github.com/lh3/miniasm) and [redbean](https://github.com/ruanjue/wtdbg2)) and compare assembly quality of different pipeline with quast.

We send this paper to a journal, and Reviewer 3 say something like that "quast isn't a good tool to evaluate high error assembly, the number of misassemblies was probably over evaluate." and it's probably true.

Miniasm and redbean perform an assembly without read correction step (and without consensus step for miniasm). The low quality of contigs sequence have an important impact on her mappability and quast could confuse a low-quality region misaligned with misassemblies.

In this blog post I want answer to two question:
- quast misassemblies count was a good tools to compare two assembly ?
- can we found easily a better metrics than just misassemblies count ?

## Quast misassemblies definition

Quast base her misassemblies analysis by align contigs against reference. To perform alignment recent version of quast use [minimap2](https://github.com/lh3/minimap2), with preset `-x asm20` [when min-identity is lower than 90%](https://github.com/ablab/quast/blob/b040cc9140c7630eea95f94cdda3b825cf4a22c3/quast_libs/ca_utils/align_contigs.py#L65). Only alignment with identity upper than `min-identity` (95% by default minimum 80%) are use by quast.

Quast define three type of misassemblies **relocation**, **translocation** and **inversion**.

### Relocation

A relocation can occure between two mapping of same contigs against the same chromosome, we have two case when this two mapping :
- is separate by a region without mapping (case **A**)
- cover the same region of chromosome  (case **B**)

![relocation definition](relocation_def.svg)

A misassembly was count when $L_x$ and $L_z$ > 1kbp (this value can't be change ?) and when $L_y$ > `extensive-mis-size` (1kbp by default).

### Translocation

A translocation occur when contig have mapping on more than one reference chromosomes.

![translocation definition](translocation_def.svg)

### Inversion

A inversion occur when contig have two consecutive mapping on the same chromosome but in different strand.

![inversion definition](inversion_def.svg)


### Important precision

For more details on quast misassemblies definition, you can read this section [3.1.1](http://quast.bioinf.spbau.ru/manual.html#misassemblies) and section [3.1.2](http://quast.bioinf.spbau.ru/manual.html#sec3.1.2) of quast manual.

`min-identity` was a very important parameter, to have a misassemblies we need to have at minimum two mapping for a contig. If the second mapping have identity under than `min-identity` threshold quast can't observe this misassemblies. But even more if we take another case with a contigs with three mapping if the mapping in middle was lowest than threshold and the gap between the two other mapping is larger than `extensize-mis-size` quast can count a misassemblies where it's isn't a missassemblies.

`min-identity` and `extensize-mis-size` have a important impact on misassemblies detection what is the effect of evolution of this two parametre on the number of misassemblies found by quast ?

## Dataset, assembly pipeline, correction and quast option

To test this, we are going to use two Nanopore datasets and one Pacbio dataset.
- Reads:
  * [Oxford nanopore D melanogaster](https://www.ebi.ac.uk/ena/data/view/SRX3676783)
  * [Oxford nanopore H sapiens chr1](http://s3.amazonaws.com/nanopore-human-wgs/chr1.sorted.bam)
  * [Pacbio RS P6-C4 C elegans](http://datasets.pacb.com.s3.amazonaws.com/2014/c_elegans/list.html)
- References:
  * [D. melanogaster](https://www.ncbi.nlm.nih.gov/assembly/GCF_000001215.4) 143.726002 Mb
  * [C. elegans](ftp://ftp.ensembl.org/pub/release-95/fasta/caenorhabditis_elegans/dna/Caenorhabditis_elegans.WBcel235.dna.toplevel.fa.gz) 100.2 Mb
  * [H. sapiens chr1](ftp://ftp.ensembl.org/pub/release-95/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.chromosome.1.fa.gz) 248.9 Mb
  
To perform assembly we use minimap2 (version 2.16-r922) and miniasm (version 0.3-r179) with recommended preset for each sequencing technology (`ava-ont` and `ava-pb`).

We use quast version v5.0.2.

## Effect of min-identity

### Low min-identity is required for uncorreted assembly

Quast use mapping with alignement identity upper than `min-identity`, what is the good value of this parameter for long-read uncorrected assembly.

File `contigs_reports/minimap_output/{output-name}.coords` in the fourth column contains the mapping quality. For each dataset we extract this value and plot in an histogram.

{{ plotly(id="mapping_identity", src="mapping_identity.js") }}

In horizontal axis we have the identity percent, in verticale axis we have the number of individu in each bins.

The black line mark quast the default identity value threshold, we can see a majority of alignment was under this threshold for uncorrected dataset usage of `min-identity 80` seem necessary.

### Effect on corrected dataset

To test the effect of correction on misassemblies count we run racon (v1.4.3) 3 times on *C. elegans* (the one with the best reference) dataset.

For not corrected assembly quast use 7049 mapping, for corrected assembly quast use 30931 (increasing ratio 4.38).

{{ plotly(id="c_elegans_map_id", src="c_elegans_map_id.js") }}

In horizontal axis we have the identity percent, in verticale axis we have the number of individu in each bins.

We can observe an increasing of mapping quality, a majority of mapping have an identity upper than 95 % compare to the uncorrected assembly.

To have an insite on effect of mapping_identity on corrected assembly we run quast with default parameter on corrected (with racon) *C. elegans* dataset.

| racon | no | yes | yes |
| -| -| -| -|
| **min-identity** | **80** | **80** | **95** |
| relocation | 1131 | 886 | 635 |
| translocation | 200 | 259 | 170 |
| inversion | 65 | 68 | 75 |
| total | 1396 | 1213 | 880 |

With `min-identity 80` the number of relocation and translocation is increase compare to the default value of `min-identity`. If quast have only one alignment of a contig, quast can't found misassemblies, by reduce the `min-identity` we increase the number of alignement and mechanicly increase the number of misassemblies.

Maybe some of this misassemblies isn't a real misassemblies but if we use the same `min-identity` value for all assembly we wan't compare. We can hope this number of fake misassemblies was the same on all condition.

## Effect of extensive-min-size on misassemblies count

Whe observe the `min-identity` parameter have a very important impacte on number of misassemblies and for uncorrected long-read assembly we need set this parameter to 80 %. Now we want observe what is the impact of `extensive-min-size` parameter.

We launch quast with different value for parameter `extensive-min-size` 1.000, 2.000, 3.000, 4.000, 5.000, 6.000, 7.000, 8.000, 9.000, 10.000, 20.000, 30.000, 40.000, 50.0000 the parameter `min-identity` was fix at 80 %.

{{ plotly(id="nb_breakpoint", src="nb_breakpoint.js") }}

In horizontal axis we have the `extensive-min-size` value in horizontal axis we have the number of misassemblies, you can click on legend to show or hide element.

This graph shows the evolution of the number of misassemblies in function of the `extensive-min-size` value, after 10.000 the number of misassemblies becomes quite stable.

This graph shows two types of misassemblies some found with `extensive-min-size` lower than 10.000 and another where `extensive-min-size` are upper than 10.000. We can't say the first group of misassemblies was a *fake* misassemblies but I think we can be sure misassemblies found with `extensive-min-size` upper than 10.000 was *true* misassemblies

### Effect of extensive-min-size on each misassemblies types count

Quast defines three types of misassemblies **relocation**, **translocation** and **inversion** previously we observe the total number of misassemblies, how each group of misassembly evolves.

{{ plotly(id="misassemblies_type", src="misassemblies_type.js") }}

In horizontal axis we have the `extensive-min-size` value in horizontal axis we have the number of misassemblies, you can click on legend to show or hide element.


For *H. sapiens* dataset didn't have any translocation because reference was composed by only one chromosome, the majority of misassemblies was relocation but when we increase the parameter extensive-min-size the number of inversions was increase.

*D. melanogaster* reference contains main small contigs this can explain the high number of translocation, relocation and translocation go down simultanly. 

For *C. elegans* the number of translocations was quite stable, the number of relocations drops down rapidly and inversion has a little increase.

I can't explain why translocation and inversion number change with a different value of `extensive-min-size`. By reading quast documentation and code I didn't understand the influence of this parameter on this group of misassemblies.

Relocation misassemblies are the most common type of misassemblies and we can impute the reduction of misassemblies to relocation misassemblies reduction.


### Relocation length distribution

We see previously for our not corrected assemblies a majority of misassemblies was relocation we are now focus on this type of misassemblies.

The file `{quast_output}/contigs_reports/all_alignements_{assembly_file_name}.tsv` contains information about mapping and misassemblies. For other information on how quast store mapping and misassemblies information read [quast faq](http://quast.bioinf.spbau.ru/manual.html#sec7).

![relocation_length.svg](relocation_length.svg)

In horizontal axis we have the log length of each point, in vertical axis we have the species, orange point for negative relocation, green point for positive relocation.

This figure shows a swarm plot of log of length associate to recombination it's the size of the gap between mapping border the misassemblies. if the length is positive assembly mis a part of reference (green point), if the length is negative assembly duplicate a part of the reference (orange point), [source code](relocation_length.py), [data](relocation_length.csv) and raw data was avaible.

For *H. sapiens* majority of relocation was positive and short (between 1000 and 5000 base), with some very large relocation. For *C. elegans* it's different, majority of relocation is negative and largest relocation was shortest than *H. sapiens*. For *D. melanogaster* the size of relocations was more spread the majority of relocation isn't the shortest this confirm by the appearance of the curve seen in the previous part when the extensize-min-size is increased, the number of relocations decreases less quickly than for the other datasets. 

With this representation we can analyse the difference between relocation distribution in term of number of relocation and her length distribution.


## Conclusion

Majority of misassembly was relocation her number drop-down rapidly when `extensive-min-size` increase this parameter has a direct impact on this relocation misassembly definition. I can't explain the translocation and inversion evolution.

I would like to say that the relocations that remain after the value of extensive-min-size are greater than 10 kb are *true* relocations. *True* in the sense that they are actualy due to assembly errors and not to a contig mappability trouble. Checking each misassembly, manually is difficult, takes a lot of time, be very arbitrary but found a good threshold for `extensive-min-size` seems impossible.

The count of misassemblies produce by quast is good assembly quality metrics even for uncorrected longread assemblies. But we need not focus on the number of misassemblies but more on the number by types and for relocations check the length distribution to see in details the effect of change on assembly pipeline.

Reduce the number of misassemblies was a good thing, for translocation and inversion we can just check the number. But for relocation remove short relocation and create large relocation isn't a good idea. Compare relocations length distribution could be a better idea, even it's less clear than a unique number. I think we can create better tools than just a human eye analysis on a plot.

## Acknowledgement

For her help in writing this blog post:
- Rayan Chikhi
- Jean-Stéphane Varré
- Matthieu Falce
- Yoann Dufresne

For her proof reading:
- [insert your name here by editing this file](https://github.com/natir/blog/blob/master/content/long-read-misassemblies/index.md)

