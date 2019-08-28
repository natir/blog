+++
template = "page.html"
title = "Uncorrected long-read misassemblies"
date = 2019-08-23
draft = true
tags = ["long-read", "assembly", "evaluation"]
+++

I think all the people who have ever done a genome assembly one day say: "Ok my assembly was cool, but how I can be sure it's the best possible one and they didn't contains many errro ?"

We have many technics to evaluate the quality of assembly (isn't a complet review sorry):
- with only assembly information:
  + with [N50 family metrics](https://doi.org/10.1089/cmb.2017.0013)
  + analysis of read remapping against assembly [ASMOValidate](http://amos.sourceforge.net/wiki/index.php/Amosvalidate), [REAPR](https://www.sanger.ac.uk/science/tools/reapr), [FRCbam](https://github.com/vezzi/FRC_align), [Pilon](https://github.com/broadinstitute/pilon/wiki), [VALET](https://www.cbcb.umd.edu/software/valet)
  + by compute the probability of the reads dataset can be get by assembly ([ALE](https://doi.org/10.1093/bioinformatics/bts723), [CGAL](https://doi.org/10.1186/gb-2013-14-1-r8), [LAP](https://doi.org/10.1186/1756-0500-6-334))
- by using external information: 
  + count the number of core gene present in assembly, [BUSCO](https://busco.ezlab.org/)
  + transcriptome information [for example *Bos taurus* genome validation](https://doi.org/10.1186/gb-2009-10-4-r42)
  + synteny information [Lui et al](https://doi.org/10.1186/s12859-018-2026-4)
  + map assembly against near genome, [quast](https://doi.org/10.1093/bioinformatics/btt086)
  + map assembly against reference genome
  
If you use quast to reference genome, you have a reference genome, so why you want preform an assembly ?

The main case where we perform something like that was when we want evaluate differente assembly pipeline on same read data set. To evaluate a complete new assembly pipeline, test different set of parameter, evaluate the impact of add or change a tools in an assembly pipeline.

Quast was a very usefull tools and they integrate now many other assembly evaluating tools (BUSCO, [GeneMark](http://exon.gatech.edu/GeneMark/), [GlimmerHMM](https://doi.org/10.1093/bioinformatics/bth315), [barnap](https://github.com/tseemann/barrnap))

Recently, with Rayan Chikhi and Jean-Stéphane Varré, I publish a [preprint](https://www.biorxiv.org/content/10.1101/674036v2) about [yacrd](https://github.com/natir/yacrd/) and [fpa](https://github.com/natir/fpa), two standalon tools they can be introduce in assembly pipeline to remove very bad reads region and filter out low quality overlap. We evaluate effect of this tools on without correction long-reads assembly pipeline ([miniasm](https://github.com/lh3/miniasm) and [redbean](https://github.com/ruanjue/wtdbg2)) and compare assembly quality of differente pipeline with quast.

We send this paper to a journal, and Reviewer 3 (it's always the reviewer 3) say something like that "quast isn't a good tools to evaluate high error assembly, the number of misassemblies was probably over evaluate." and it's true. Miniasm and redbean perform an assembly without read correction step (and without consensus step form miniasm). The low quality of contigs sequence, have important impact on her mappability and quast could confuse a low quality region misaligned with a misassemblies. First question what is a quast misassemblies?

## Quast misassemblies definition

To define quast misassemblies we going to use simple exemple, we have a genome with one no circular chromosomes, our assembly contains only one contigs, this contigs map against the reference(green part) and didn't map (red part).

![misassemblies_def.svg](misassemblies_def.svg)

A misassembly occure when, $L_n$ > `--extensive-mis-size` (1kbp by default) option and $L_{m1}$ and $L_{m2}$ > 1kbp (this value cann't be change ?).

In my exemple contig mis a part of reference, maybe a repetition contraction. It's possible the contig contains something not present in chromosome, maybe a repetition expansion, in this case mappings begin of $L_{m2}$ was before end of $L_{m1}$. This type of misassemblies was called **Relocation** by quast.

**Translocation** occure when a contigs map on two different chromosome and **inversion** occure when contig map on same chromosome but in differente strand. For more details on quast misassemblies definition you can read this section [3.1.1](http://quast.bioinf.spbau.ru/manual.html#misassemblies) and section [3.1.2](http://quast.bioinf.spbau.ru/manual.html#sec3.1.2) of quast manual.

**Important note :**
- alignement with an identity lower than `--min-identity` (95% by default minimum 80%) aren't used by quast
- to perform alignement of contigs against references recent version of quast use [minimap2](https://github.com/lh3/minimap2), with preset `-x asm20` [when --min-identity is lower than 90%](https://github.com/ablab/quast/blob/b040cc9140c7630eea95f94cdda3b825cf4a22c3/quast_libs/ca_utils/align_contigs.py#L65)

If `--min-identity` was to high a good alignment can be filter out and create a large gap in mapping count as misassemblies. If `--extensive-mis-size` was to small many short gap create by errors in contigs can be create misassemblies.

We can tune this two parametre, in the rest of this blogpost I will show the impact of the `extensive-mis-size` parameter on the number of misassemblies found by quast

## Dataset, assembly pipeline and quast option

For this test we are going to use two Nanopore dataset and one Pacbio dataset.
- Reads:
  * [Oxford nanopore D melanogaster](https://www.ebi.ac.uk/ena/data/view/SRX3676783)
  * [Oxford nanopore H sapiens chr1](http://s3.amazonaws.com/nanopore-human-wgs/chr1.sorted.bam)
  * [Pacbio RS P6-C4 C elegans](http://datasets.pacb.com.s3.amazonaws.com/2014/c_elegans/list.html)
- References:
  * [D. melanogaster](https://www.ncbi.nlm.nih.gov/assembly/GCF_000001215.4) 143.726002 Mb
  * [C. elegans](ftp://ftp.ensembl.org/pub/release-95/fasta/caenorhabditis_elegans/dna/Caenorhabditis_elegans.WBcel235.dna.toplevel.fa.gz) 100.2 Mb
  * [H. sapiens chr1](ftp://ftp.ensembl.org/pub/release-95/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.chromosome.1.fa.gz) 248.9 Mb
  
To perform assembly we use Minimap2 (version 2.16-r922) and Miniasm (version 0.3-r179) with recommand preset for each sequencing technology (`ava-ont` and `ava-pb`).

We launch quast (version v5.0.2) with different value for parameter `extensive-min-size` 1.000, 2.000, 3.000, 4.000, 5.000, 6.000, 7.000, 8.000, 9.000, 10.000, 20.000, 30.000, 40.000, 50.0000 the parameter `--min-identity` was fix at 80 %.

## Effect of increase extensive-min-size

### Number of misassemblies

{{ plotly(id="nb_breakpoint", src="nb_breakpoint.js") }}

This graph shows the evolution of the number of misassemblies in function of the `extensive-min-size` value, after 10.000 the numbre of misassemblies become quiet stable.

This graph show two type of misassemblies some found with `extensive-min-size` lower than 10.000 and another where `extensive-min-size` are upper than 10.000. We can't say the first group of misassemblies was a *fake* misassemblies but I think we can be sure misassemblies found with `extensive-min-size` upper than 10.000 was *true* misassemblies

### Misassemblies group

Quast define three type of misassemblies **relocation**, **translocation** and **inversion** previously we observe the total number of misassemblies, how each group of misassembly evolve.

{{ plotly(id="misassemblies_type", src="misassemblies_type.js") }}

For *H. sapiens* dataset didn't have any translocation because reference was composed by only one chromosome, majority of misassemblies was relocation but when we increase the parametere extensive-min-size the number of inversion was increase.

*D. melanogaster* reference contains main small contigs this can explain the high number of translocation, relocation and translocation go down simultanly. 

For *C. elegans* the number of translocations was quiest stable, the number of relocations drop down rapidly and inversion have a little increase.

I can't explain why translocation and inversion number change with different value of `extensive-min-size`. By reading quast documentation and code I didn't understand the influence of this parameter on this group of misassemblies.

Relocation misassemblies are the most common type of misassemblies and we can impute the reduction of misassemblies to relocation misassemblies reduction.

### Relocation length distribution

The file `{quast_output}/contigs_reports/all_alignements_{assembly_file_name}.tsv` contains information about mapping and misassemblies. For other information on how quast store mapping and misassemblies information read [quast faq](http://quast.bioinf.spbau.ru/manual.html#sec7).

{{ plotly(id="relocation_length", src="relocation_length.js") }}

This figure show the length associate to recombination, if length is positive assembly mis a part of reference, if length is negative assembly duplicate a part of reference.

For *H. sapiens* majorite of relocation was between 1000 and 5000 base in majority of case miniasm mis part of genome. *C. elegans* in contrast is more spread and in negative value. But whe are not only intrest by the majority of relocation, if our modification of assembly pipeline haven't any impacte on small relocation but remove all largest relocation it's a good think too. By clicking on icons <svg viewBox="0 0 1000 1000" class="icon" height="1em" width="1em"><path d="m250 850l-187 0-63 0 0-62 0-188 63 0 0 188 187 0 0 62z m688 0l-188 0 0-62 188 0 0-188 62 0 0 188 0 62-62 0z m-875-938l0 188-63 0 0-188 0-62 63 0 187 0 0 62-187 0z m875 188l0-188-188 0 0-62 188 0 62 0 0 62 0 188-62 0z m-125 188l-1 0-93-94-156 156 156 156 92-93 2 0 0 250-250 0 0-2 93-92-156-156-156 156 94 92 0 2-250 0 0-250 0 0 93 93 157-156-157-156-93 94 0 0 0-250 250 0 0 0-94 93 156 157 156-157-93-93 0 0 250 0 0 250z" transform="matrix(1 0 0 -1 0 850)"></path></svg> in the right corner of figure you unzoom (<svg viewBox="0 0 928.6 1000" class="icon" height="1em" width="1em"><path d="m786 296v-267q0-15-11-26t-25-10h-214v214h-143v-214h-214q-15 0-25 10t-11 26v267q0 1 0 2t0 2l321 264 321-264q1-1 1-4z m124 39l-34-41q-5-5-12-6h-2q-7 0-12 3l-386 322-386-322q-7-4-13-4-7 2-12 7l-35 41q-4 5-3 13t6 12l401 334q18 15 42 15t43-15l136-114v109q0 8 5 13t13 5h107q8 0 13-5t5-13v-227l122-102q5-5 6-12t-4-13z" transform="matrix(1 0 0 -1 0 850)"></path></svg> reset original zoom).
We can see *H. sapiens* contains some very large relocation.

## Conclusion

Majority of misassembly was relocation her number drop down rapidly when `extensive-min-size` increase this parameter have a direct impacte on this relocation misassembly definition. I can't explain the translocation and inversion evolution.

I would like to say that the relocations that remain after the value of extensive-min-size is greater than 10 kb are *true* relocations. *True* in the sense that they are actually due to assembly errors and not to a contig mapability trouble. Checking each misassembly, manually is difficult, take a lot of time, be very arbitrary but found a good threshold for `extensive-min-size` seems impossible.

Misassemblies quast metrics was good, for long reads uncorrected assemblies maybe the name isn't the good one, **large unalignement** was maybe a better name ? Finaly it's still an assemblies evaluation metrics if you reduce the *# misassemblies* number you improve your assemblies.

Reduce misassemblies number was a good think but remove short misassemblies and create large misassemblies isn't a good idea. Compare misassemblies length distribution could be a better idea, even it's less clear than a uniq number. I think we can create a better tools than just a boxplot human eye analysis.

## Acknowledgement

For her help in writing this blog post:
- Rayan Chikhi
- Jean-Stéphane Varré

For her proof reading:
-

